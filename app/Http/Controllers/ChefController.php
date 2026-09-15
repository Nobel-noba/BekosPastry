<?php

namespace App\Http\Controllers;

use App\Models\BatchIngredientUsage;
use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Models\ProductTransfer;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\Wastage;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ChefController extends Controller
{
    /**
     * Display Chef's Kitchen Station Dashboard.
     */
    public function dashboard(): Response
    {
        // 1. Kitchen Pantry Ingredients with low stock warning
        $kitchenIngredients = Ingredient::orderBy('name')->get();

        // 2. What Can We Bake Right Now? (Theoretical capacity from current kitchen_stock)
        $bakeableProducts = Product::with(['approvedRecipe.ingredients.ingredient'])
            ->where('is_active', true)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'kitchen_ready_stock' => $product->kitchen_ready_stock,
                    'has_approved_recipe' => $product->approvedRecipe !== null,
                    'max_possible_batches' => $product->calculatePossibleBatches(),
                    'approved_recipe' => $product->approvedRecipe ? [
                        'id' => $product->approvedRecipe->id,
                        'version' => $product->approvedRecipe->version,
                        'ingredients_count' => $product->approvedRecipe->ingredients->count(),
                    ] : null,
                ];
            });

        // 3. Active production batches
        $activeBatches = ProductionBatch::with(['product', 'recipe'])
            ->where('status', 'in_progress')
            ->latest()
            ->get();

        // 4. Today's metrics
        $todayBatches = ProductionBatch::where('status', 'completed')
            ->whereDate('completed_at', Carbon::today())
            ->get();

        $todayCakesProduced = $todayBatches->sum('actual_quantity');
        $todayAvgYield = $todayBatches->isEmpty() ? 100.0 : round($todayBatches->avg('yield_efficiency_percent'), 1);

        // 5. Pending Recipe Approvals by Chef
        $pendingRecipes = Recipe::with(['product'])
            ->where('created_by', Auth::id())
            ->where('status', 'pending_approval')
            ->get();

        return Inertia::render('Chef/Dashboard', [
            'kitchen_ingredients' => $kitchenIngredients,
            'bakeable_products' => $bakeableProducts,
            'active_batches' => $activeBatches,
            'pending_recipes' => $pendingRecipes,
            'metrics' => [
                'today_cakes_produced' => $todayCakesProduced,
                'today_avg_yield' => $todayAvgYield,
                'completed_batches_today' => $todayBatches->count(),
                'active_batch_count' => $activeBatches->count(),
            ],
        ]);
    }

    /**
     * Chef's Recipes list and Recipe Formulation.
     */
    public function recipes(): Response
    {
        $recipes = Recipe::with(['product', 'ingredients.ingredient', 'approver'])
            ->latest()
            ->get()
            ->map(function ($recipe) {
                return [
                    'id' => $recipe->id,
                    'product_id' => $recipe->product_id,
                    'product_name' => $recipe->product->name,
                    'product_category' => $recipe->product->category,
                    'version' => $recipe->version,
                    'batch_yield' => $recipe->batch_yield,
                    'prep_time_minutes' => $recipe->prep_time_minutes,
                    'instructions' => $recipe->instructions,
                    'status' => $recipe->status,
                    'approved_at' => $recipe->approved_at?->format('M d, Y H:i'),
                    'admin_feedback' => $recipe->admin_feedback,
                    'total_cost' => $recipe->calculateTotalCost(),
                    'ingredients' => $recipe->ingredients->map(function ($ri) {
                        return [
                            'ingredient_id' => $ri->ingredient_id,
                            'ingredient_name' => $ri->ingredient->name,
                            'quantity_required' => $ri->quantity_required,
                            'unit' => $ri->unit,
                        ];
                    }),
                ];
            });

        $products = Product::where('is_active', true)->orderBy('name')->get();
        $ingredients = Ingredient::orderBy('name')->get();

        return Inertia::render('Chef/Recipes', [
            'recipes' => $recipes,
            'products' => $products,
            'ingredients' => $ingredients,
        ]);
    }

    /**
     * Chef formulates or updates a recipe (Locks to pending_approval until Admin approves).
     */
    public function storeRecipe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'batch_yield' => 'required|integer|min:1',
            'prep_time_minutes' => 'nullable|integer|min:1',
            'instructions' => 'nullable|string',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.ingredient_id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity_required' => 'required|numeric|min:0.0001',
            'ingredients.*.unit' => 'required|string',
        ]);

        DB::transaction(function () use ($validated) {
            // Find latest version for this product
            $latestVersion = Recipe::where('product_id', $validated['product_id'])->max('version') ?? 0;

            $recipe = Recipe::create([
                'product_id' => $validated['product_id'],
                'version' => $latestVersion + 1,
                'batch_yield' => $validated['batch_yield'],
                'prep_time_minutes' => $validated['prep_time_minutes'],
                'instructions' => $validated['instructions'],
                'status' => 'pending_approval', // Strictly pending until Admin approves
                'created_by' => Auth::id(),
                'approved_by' => null,
                'approved_at' => null,
                'admin_feedback' => null,
            ]);

            foreach ($validated['ingredients'] as $item) {
                RecipeIngredient::create([
                    'recipe_id' => $recipe->id,
                    'ingredient_id' => $item['ingredient_id'],
                    'quantity_required' => $item['quantity_required'],
                    'unit' => $item['unit'],
                ]);
            }
        });

        return back()->with('success', 'Recipe submitted for Admin review. Kitchen production will unlock upon approval.');
    }

    /**
     * Batch Production Screen.
     */
    public function production(): Response
    {
        // Only products that have an APPROVED recipe can be produced!
        $approvedProducts = Product::with(['approvedRecipe.ingredients.ingredient'])
            ->where('is_active', true)
            ->get()
            ->filter(function ($p) {
                return $p->approvedRecipe !== null;
            })
            ->values()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'category' => $p->category,
                    'recipe_id' => $p->approvedRecipe->id,
                    'kitchen_ready_stock' => $p->kitchen_ready_stock,
                    'possible_batches' => $p->calculatePossibleBatches(),
                    'recipe_ingredients' => $p->approvedRecipe->ingredients->map(function ($ri) {
                        return [
                            'ingredient_id' => $ri->ingredient_id,
                            'name' => $ri->ingredient->name,
                            'quantity_required' => (float) $ri->quantity_required,
                            'unit' => $ri->unit,
                            'kitchen_stock' => (float) $ri->ingredient->kitchen_stock,
                        ];
                    }),
                ];
            });

        $batches = ProductionBatch::with(['product', 'recipe', 'ingredientUsages.ingredient', 'chef'])
            ->latest()
            ->get();

        return Inertia::render('Chef/Production', [
            'approved_products' => $approvedProducts,
            'batches' => $batches,
        ]);
    }

    /**
     * Start a new production batch (locked strictly to approved recipes).
     */
    public function startBatch(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'planned_quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::with('approvedRecipe.ingredients.ingredient')->findOrFail($validated['product_id']);

        if (! $product->approvedRecipe) {
            return back()->with('error', 'Cannot start production: This product does not have an approved recipe by the Admin.');
        }

        // Check if kitchen stock is sufficient
        $insufficient = [];
        foreach ($product->approvedRecipe->ingredients as $ri) {
            $needed = (float) $ri->quantity_required * $validated['planned_quantity'];
            if ((float) $ri->ingredient->kitchen_stock < $needed) {
                $insufficient[] = "{$ri->ingredient->name} (Needed: {$needed} {$ri->unit}, Kitchen has: {$ri->ingredient->kitchen_stock} {$ri->unit})";
            }
        }

        if (! empty($insufficient)) {
            return back()->with('error', 'Insufficient kitchen ingredients: '.implode('; ', $insufficient));
        }

        ProductionBatch::create([
            'batch_code' => 'BATCH-'.date('Ymd').'-'.strtoupper(Str::random(4)),
            'product_id' => $product->id,
            'recipe_id' => $product->approvedRecipe->id,
            'chef_id' => Auth::id(),
            'planned_quantity' => $validated['planned_quantity'],
            'actual_quantity' => 0,
            'yield_efficiency_percent' => 100.00,
            'status' => 'in_progress',
            'started_at' => Carbon::now(),
            'notes' => $validated['notes'] ?? null,
        ]);

        return back()->with('success', "Production batch started for {$validated['planned_quantity']} {$product->name}.");
    }

    /**
     * Complete production batch: deducts ingredients from kitchen_stock, credits finished cakes, computes efficiency.
     */
    public function completeBatch(Request $request, ProductionBatch $batch): RedirectResponse
    {
        $validated = $request->validate([
            'actual_quantity' => 'required|integer|min:0',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($batch->status !== 'in_progress') {
            return back()->with('error', 'This batch is already completed or cancelled.');
        }

        $batch->load(['recipe.ingredients.ingredient', 'product']);

        DB::transaction(function () use ($batch, $validated) {
            $planned = $batch->planned_quantity;
            $actual = $validated['actual_quantity'];

            // Yield efficiency formula: (actual / planned) * 100
            $efficiency = $planned > 0 ? round(($actual / $planned) * 100, 2) : 100.00;

            // Deduct ingredients according to approved recipe BOM
            foreach ($batch->recipe->ingredients as $ri) {
                $standardQty = (float) $ri->quantity_required * $planned;
                // Deduct from kitchen pantry stock
                $ri->ingredient->decrement('kitchen_stock', $standardQty);

                // Record batch usage
                BatchIngredientUsage::create([
                    'production_batch_id' => $batch->id,
                    'ingredient_id' => $ri->ingredient_id,
                    'standard_quantity' => $standardQty,
                    'actual_quantity' => $standardQty,
                    'variance' => 0.000,
                ]);
            }

            // Increment finished cakes ready in kitchen
            $batch->product->increment('kitchen_ready_stock', $actual);

            // Update batch
            $batch->update([
                'actual_quantity' => $actual,
                'yield_efficiency_percent' => $efficiency,
                'status' => 'completed',
                'completed_at' => Carbon::now(),
                'notes' => $validated['notes'] ?? $batch->notes,
            ]);
        });

        return back()->with('success', "Batch completed! Yield efficiency: {$batch->yield_efficiency_percent}%. {$validated['actual_quantity']} {$batch->product->name} added to kitchen stock.");
    }

    /**
     * Kitchen Product Transfers to Sales Counter.
     */
    public function transfers(): Response
    {
        $products = Product::where('is_active', true)->where('kitchen_ready_stock', '>', 0)->get();
        $transfers = ProductTransfer::with(['product', 'chef', 'sales'])
            ->latest()
            ->get();

        return Inertia::render('Chef/Transfers', [
            'products' => $products,
            'transfers' => $transfers,
        ]);
    }

    /**
     * Dispatch finished pastries to Sales Counter.
     */
    public function storeTransfer(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
        ]);

        $product = Product::findOrFail($validated['product_id']);

        if ($product->kitchen_ready_stock < $validated['quantity']) {
            return back()->with('error', "Insufficient kitchen stock. Only {$product->kitchen_ready_stock} units available.");
        }

        DB::transaction(function () use ($product, $validated) {
            // Deduct from kitchen holding stock
            $product->decrement('kitchen_ready_stock', $validated['quantity']);

            ProductTransfer::create([
                'transfer_code' => 'TRF-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'product_id' => $product->id,
                'quantity' => $validated['quantity'],
                'chef_id' => Auth::id(),
                'sales_id' => null,
                'status' => 'pending',
                'transferred_at' => Carbon::now(),
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', "Transfer created! {$validated['quantity']} {$product->name} dispatched to Sales Counter.");
    }

    /**
     * Chef's Wastage Recording Screen.
     */
    public function wastage(): Response
    {
        $ingredients = Ingredient::orderBy('name')->get();
        $products = Product::where('is_active', true)->orderBy('name')->get();
        $wastages = Wastage::with(['ingredient', 'product', 'reporter'])
            ->whereIn('stage', ['raw_material', 'kitchen_production'])
            ->latest()
            ->get();

        return Inertia::render('Chef/Wastage', [
            'ingredients' => $ingredients,
            'products' => $products,
            'wastages' => $wastages,
        ]);
    }

    /**
     * Record Kitchen Wastage (Raw material or kitchen production).
     * Automatically computes and deducts lost product/cake yield!
     */
    public function storeWastage(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'stage' => 'required|in:raw_material,kitchen_production',
            'ingredient_id' => 'nullable|required_if:stage,raw_material|exists:ingredients,id',
            'product_id' => 'nullable|required_if:stage,kitchen_production|exists:products,id',
            'quantity' => 'required|numeric|min:0.01',
            'reason' => 'required|string|max:100',
            'notes' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated) {
            $costLoss = 0;
            $lostCakePotential = 0;
            $unit = 'pcs';

            if ($validated['stage'] === 'raw_material') {
                $ingredient = Ingredient::findOrFail($validated['ingredient_id']);
                $unit = $ingredient->unit;
                $costLoss = round((float) $ingredient->cost_per_unit * (float) $validated['quantity'], 2);

                // Deduct from kitchen pantry stock
                $ingredient->decrement('kitchen_stock', min((float) $ingredient->kitchen_stock, (float) $validated['quantity']));

                // Calculate lost cake yield based on approved recipes
                $lostCakePotential = Wastage::calculatePotentialCakeLoss($ingredient->id, (float) $validated['quantity']);
            } else {
                $product = Product::findOrFail($validated['product_id']);
                $costLoss = round((float) $product->estimated_cost * (int) $validated['quantity'], 2);
                $lostCakePotential = (int) $validated['quantity'];

                // Deduct from kitchen ready stock if ruined in kitchen
                $product->decrement('kitchen_ready_stock', min($product->kitchen_ready_stock, (int) $validated['quantity']));
            }

            Wastage::create([
                'tracking_code' => 'WASTE-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'stage' => $validated['stage'],
                'ingredient_id' => $validated['ingredient_id'] ?? null,
                'product_id' => $validated['product_id'] ?? null,
                'quantity' => $validated['quantity'],
                'unit' => $unit,
                'cost_loss' => $costLoss,
                'potential_product_loss_qty' => $lostCakePotential,
                'reason' => $validated['reason'],
                'reported_by' => Auth::id(),
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return back()->with('success', 'Wastage recorded successfully. Kitchen inventory and potential product yields updated.');
    }
}
