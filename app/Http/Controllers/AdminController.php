<?php

namespace App\Http\Controllers;

use App\Models\Ingredient;
use App\Models\IngredientSupply;
use App\Models\KitchenAllocation;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Models\Recipe;
use App\Models\SalesOrder;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Wastage;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the Executive Productivity Dashboard.
     */
    public function dashboard(): Response
    {
        // 1. Productivity & Yield Metrics
        $completedBatches = ProductionBatch::where('status', 'completed')->get();
        $averageYieldEfficiency = $completedBatches->isEmpty()
            ? 100.00
            : round($completedBatches->avg('yield_efficiency_percent'), 1);

        $totalCakesPlanned = $completedBatches->sum('planned_quantity');
        $totalCakesProduced = $completedBatches->sum('actual_quantity');

        // 2. Financial Metrics
        $totalSalesRevenue = (float) SalesOrder::where('status', 'completed')->sum('total_amount');
        $totalSupplySpend = (float) IngredientSupply::sum('total_cost');
        $totalWastageLoss = (float) Wastage::sum('cost_loss');
        $netEstimatedProfit = round($totalSalesRevenue - $totalWastageLoss, 2);

        // 3. Wastage Lost Cakes Impact
        $totalLostCakePotential = (int) Wastage::sum('potential_product_loss_qty');
        $wastageByStage = [
            'raw_material' => (float) Wastage::where('stage', 'raw_material')->sum('cost_loss'),
            'kitchen_production' => (float) Wastage::where('stage', 'kitchen_production')->sum('cost_loss'),
            'sales_counter' => (float) Wastage::where('stage', 'sales_counter')->sum('cost_loss'),
        ];

        // 4. Theoretical Production Capacity from Current Kitchen Stock
        $activeProducts = Product::with(['approvedRecipe.ingredients.ingredient'])
            ->where('is_active', true)
            ->get();

        $capacityOverview = $activeProducts->map(function ($prod) {
            return [
                'id' => $prod->id,
                'name' => $prod->name,
                'category' => $prod->category,
                'selling_price' => $prod->selling_price,
                'current_display_stock' => $prod->current_display_stock,
                'kitchen_ready_stock' => $prod->kitchen_ready_stock,
                'possible_from_kitchen_stock' => $prod->calculatePossibleBatches(),
                'has_approved_recipe' => $prod->approvedRecipe !== null,
            ];
        });

        // 5. Low Stock Alerts
        $lowStockIngredients = Ingredient::all()->filter(function ($ing) {
            return $ing->isKitchenStockLow();
        })->values();

        // 6. Pending Recipe Approvals
        $pendingRecipesCount = Recipe::where('status', 'pending_approval')->count();

        // 7. Recent Activities
        $recentBatches = ProductionBatch::with(['product', 'chef'])
            ->latest()
            ->take(5)
            ->get();

        $recentWastages = Wastage::with(['ingredient', 'product', 'reporter'])
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Admin/Dashboard', [
            'metrics' => [
                'average_yield_efficiency' => $averageYieldEfficiency,
                'total_cakes_planned' => $totalCakesPlanned,
                'total_cakes_produced' => $totalCakesProduced,
                'total_sales_revenue' => $totalSalesRevenue,
                'total_supply_spend' => $totalSupplySpend,
                'total_wastage_loss' => $totalWastageLoss,
                'net_estimated_profit' => $netEstimatedProfit,
                'total_lost_cake_potential' => $totalLostCakePotential,
                'wastage_by_stage' => $wastageByStage,
                'pending_recipes_count' => $pendingRecipesCount,
            ],
            'capacity_overview' => $capacityOverview,
            'low_stock_ingredients' => $lowStockIngredients,
            'recent_batches' => $recentBatches,
            'recent_wastages' => $recentWastages,
        ]);
    }

    /**
     * Supplies and Kitchen Inventory Management.
     */
    public function supplies(): Response
    {
        $ingredients = Ingredient::orderBy('name')->get();
        $suppliers = Supplier::orderBy('name')->get();
        $recentSupplies = IngredientSupply::with(['supplier', 'ingredient', 'receiver'])
            ->latest()
            ->take(20)
            ->get();
        $recentAllocations = KitchenAllocation::with(['ingredient', 'allocator'])
            ->latest()
            ->take(20)
            ->get();

        return Inertia::render('Admin/Supplies', [
            'ingredients' => $ingredients,
            'suppliers' => $suppliers,
            'recent_supplies' => $recentSupplies,
            'recent_allocations' => $recentAllocations,
        ]);
    }

    /**
     * Record new incoming supply delivery into Main Store.
     */
    public function storeSupply(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
            'unit_cost' => 'required|numeric|min:0',
            'batch_number' => 'nullable|string|max:100',
            'expiry_date' => 'nullable|date',
            'notes' => 'nullable|string|max:500',
        ]);

        $totalCost = round($validated['quantity'] * $validated['unit_cost'], 2);

        DB::transaction(function () use ($validated, $totalCost) {
            IngredientSupply::create([
                'supplier_id' => $validated['supplier_id'],
                'ingredient_id' => $validated['ingredient_id'],
                'quantity' => $validated['quantity'],
                'unit_cost' => $validated['unit_cost'],
                'total_cost' => $totalCost,
                'batch_number' => $validated['batch_number'] ?? 'SUP-'.strtoupper(Str::random(6)),
                'expiry_date' => $validated['expiry_date'],
                'received_by' => Auth::id(),
                'notes' => $validated['notes'],
            ]);

            // Increment Central Store stock
            $ingredient = Ingredient::find($validated['ingredient_id']);
            $ingredient->increment('main_store_stock', $validated['quantity']);
            // Update latest cost per unit
            $ingredient->update(['cost_per_unit' => $validated['unit_cost']]);
        });

        return back()->with('success', 'Supply recorded and added to Main Store inventory.');
    }

    /**
     * Admin assigns / allocates resources from Main Store to the Kitchen Pantry.
     */
    public function allocateToKitchen(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'ingredient_id' => 'required|exists:ingredients,id',
            'quantity' => 'required|numeric|min:0.01',
            'notes' => 'nullable|string|max:500',
        ]);

        $ingredient = Ingredient::findOrFail($validated['ingredient_id']);

        if ((float) $ingredient->main_store_stock < (float) $validated['quantity']) {
            return back()->with('error', "Insufficient main store stock. Only {$ingredient->main_store_stock} {$ingredient->unit} available.");
        }

        DB::transaction(function () use ($ingredient, $validated) {
            // Deduct from Main Store, add to Kitchen Pantry
            $ingredient->decrement('main_store_stock', $validated['quantity']);
            $ingredient->increment('kitchen_stock', $validated['quantity']);

            KitchenAllocation::create([
                'allocation_code' => 'K-ALLOC-'.date('Ymd').'-'.strtoupper(Str::random(4)),
                'ingredient_id' => $ingredient->id,
                'quantity' => $validated['quantity'],
                'allocated_by' => Auth::id(),
                'notes' => $validated['notes'],
                'allocated_at' => Carbon::now(),
            ]);
        });

        return back()->with('success', "Allocated {$validated['quantity']} {$ingredient->unit} of {$ingredient->name} to the Kitchen Pantry successfully.");
    }

    /**
     * Store a newly created Supplier.
     */
    public function storeSupplier(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_person' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:255',
            'notes' => 'nullable|string|max:500',
        ]);

        $supplier = Supplier::create($validated);

        return back()->with('success', "Supplier '{$supplier->name}' registered successfully.");
    }

    /**
     * Store a newly created Ingredient.
     */
    public function storeIngredient(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100|unique:ingredients,sku',
            'category' => 'required|string|max:100',
            'unit' => 'required|string|max:20',
            'main_store_stock' => 'nullable|numeric|min:0',
            'kitchen_stock' => 'nullable|numeric|min:0',
            'minimum_alert_level' => 'required|numeric|min:0',
            'cost_per_unit' => 'required|numeric|min:0',
            'description' => 'nullable|string|max:500',
        ]);

        if (empty($validated['sku'])) {
            $words = explode(' ', $validated['name']);
            $abbr = strtoupper(substr($words[0], 0, 3));
            $validated['sku'] = 'ING-'.$abbr.'-'.strtoupper(Str::random(4));
        }

        $validated['main_store_stock'] = $validated['main_store_stock'] ?? 0;
        $validated['kitchen_stock'] = $validated['kitchen_stock'] ?? 0;

        $ingredient = Ingredient::create($validated);

        return back()->with('success', "Ingredient '{$ingredient->name}' created successfully.");
    }

    /**
     * Recipe Approvals and Catalog.
     */
    public function recipes(): Response
    {
        $recipes = Recipe::with(['product', 'creator', 'approver', 'ingredients.ingredient'])
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
                    'created_by_name' => $recipe->creator->name,
                    'approved_by_name' => $recipe->approver?->name,
                    'approved_at' => $recipe->approved_at?->format('Y-m-d H:i'),
                    'admin_feedback' => $recipe->admin_feedback,
                    'total_cost' => $recipe->calculateTotalCost(),
                    'selling_price' => $recipe->product->selling_price,
                    'ingredients' => $recipe->ingredients->map(function ($ri) {
                        return [
                            'ingredient_name' => $ri->ingredient->name,
                            'quantity_required' => $ri->quantity_required,
                            'unit' => $ri->unit,
                            'unit_cost' => $ri->ingredient->cost_per_unit,
                            'ingredient_kitchen_stock' => $ri->ingredient->kitchen_stock,
                        ];
                    }),
                ];
            });

        return Inertia::render('Admin/Recipes', [
            'recipes' => $recipes,
        ]);
    }

    /**
     * Approve Chef's submitted recipe.
     */
    public function approveRecipe(Request $request, Recipe $recipe): RedirectResponse
    {
        $validated = $request->validate([
            'admin_feedback' => 'nullable|string|max:500',
        ]);

        $recipe->update([
            'status' => 'approved',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
            'admin_feedback' => $validated['admin_feedback'] ?? 'Approved for kitchen production.',
        ]);

        // Update product estimated cost
        $recipe->product->update([
            'estimated_cost' => $recipe->calculateTotalCost(),
        ]);

        return back()->with('success', "Recipe for {$recipe->product->name} approved! Production is now unlocked for the kitchen.");
    }

    /**
     * Reject Chef's recipe with required feedback.
     */
    public function rejectRecipe(Request $request, Recipe $recipe): RedirectResponse
    {
        $validated = $request->validate([
            'admin_feedback' => 'required|string|max:500',
        ]);

        $recipe->update([
            'status' => 'rejected',
            'approved_by' => Auth::id(),
            'approved_at' => Carbon::now(),
            'admin_feedback' => $validated['admin_feedback'],
        ]);

        return back()->with('success', 'Recipe rejected with feedback. Chef Marcus has been notified to revise.');
    }

    /**
     * Product Catalog Management.
     */
    public function products(): Response
    {
        $products = Product::with(['approvedRecipe'])
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                return [
                    'id' => $p->id,
                    'name' => $p->name,
                    'sku' => $p->sku,
                    'category' => $p->category,
                    'description' => $p->description,
                    'selling_price' => $p->selling_price,
                    'estimated_cost' => $p->estimated_cost,
                    'current_display_stock' => $p->current_display_stock,
                    'kitchen_ready_stock' => $p->kitchen_ready_stock,
                    'shelf_life_days' => $p->shelf_life_days,
                    'image_url' => $p->image_url,
                    'is_active' => $p->is_active,
                    'has_approved_recipe' => $p->approvedRecipe !== null,
                    'possible_yield_from_kitchen' => $p->calculatePossibleBatches(),
                ];
            });

        return Inertia::render('Admin/Products', [
            'products' => $products,
        ]);
    }

    /**
     * Create or update a product.
     */
    public function storeProduct(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:products,id',
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:100',
            'category' => 'required|string|max:100',
            'description' => 'nullable|string',
            'selling_price' => 'required|numeric|min:0.01',
            'shelf_life_days' => 'required|integer|min:1',
            'image_url' => 'nullable|url',
            'is_active' => 'boolean',
        ]);

        if (! empty($validated['id'])) {
            $product = Product::findOrFail($validated['id']);
            $product->update($validated);
            $msg = 'Product updated successfully.';
        } else {
            Product::create($validated);
            $msg = 'New product created successfully.';
        }

        return back()->with('success', $msg);
    }

    /**
     * Wastage Audit Screen.
     */
    public function wastage(): Response
    {
        $wastages = Wastage::with(['ingredient', 'product', 'reporter'])
            ->latest()
            ->get();

        $totalCostLoss = $wastages->sum('cost_loss');
        $totalLostCakes = $wastages->sum('potential_product_loss_qty');

        return Inertia::render('Admin/Wastage', [
            'wastages' => $wastages,
            'summary' => [
                'total_cost_loss' => $totalCostLoss,
                'total_lost_cakes' => $totalLostCakes,
                'raw_loss' => $wastages->where('stage', 'raw_material')->sum('cost_loss'),
                'kitchen_loss' => $wastages->where('stage', 'kitchen_production')->sum('cost_loss'),
                'counter_loss' => $wastages->where('stage', 'sales_counter')->sum('cost_loss'),
            ],
        ]);
    }

    /**
     * User / Staff Management.
     */
    public function users(): Response
    {
        $users = User::orderBy('name')->get();

        return Inertia::render('Admin/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Store or update user.
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'id' => 'nullable|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|in:admin,chef,sales',
            'phone' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
            'password' => 'nullable|min:6',
        ]);

        if (! empty($validated['id'])) {
            $user = User::findOrFail($validated['id']);
            if (empty($validated['password'])) {
                unset($validated['password']);
            } else {
                $validated['password'] = Hash::make($validated['password']);
            }
            $user->update($validated);
            $msg = 'User updated successfully.';
        } else {
            $validated['password'] = Hash::make($validated['password'] ?? 'password');
            User::create($validated);
            $msg = 'New staff member added successfully.';
        }

        return back()->with('success', $msg);
    }
}
