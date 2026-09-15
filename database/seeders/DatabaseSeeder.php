<?php

namespace Database\Seeders;

use App\Models\BatchIngredientUsage;
use App\Models\Ingredient;
use App\Models\IngredientSupply;
use App\Models\KitchenAllocation;
use App\Models\Product;
use App\Models\ProductionBatch;
use App\Models\ProductTransfer;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\SalesOrder;
use App\Models\SalesOrderItem;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Wastage;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Users
        $admin = User::create([
            'name' => 'Beki (Owner & Manager)',
            'email' => 'admin@beki.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'phone' => '+1 (555) 019-2831',
            'status' => 'active',
        ]);

        $chef = User::create([
            'name' => 'Chef Marcus (Head Pastry Chef)',
            'email' => 'chef@beki.com',
            'password' => Hash::make('password'),
            'role' => 'chef',
            'phone' => '+1 (555) 014-9922',
            'status' => 'active',
        ]);

        $sales = User::create([
            'name' => 'Sara (Front Counter & POS)',
            'email' => 'sales@beki.com',
            'password' => Hash::make('password'),
            'role' => 'sales',
            'phone' => '+1 (555) 018-7733',
            'status' => 'active',
        ]);

        // 2. Suppliers
        $supFlour = Supplier::create([
            'name' => 'Apex Flour Mills & Grains',
            'contact_person' => 'Robert Miller',
            'email' => 'robert@apexflour.com',
            'phone' => '+1 (555) 234-1100',
            'address' => '420 Grain Way, Industrial Park',
            'notes' => 'Primary flour and wheat grain distributor. Weekly delivery every Monday.',
        ]);

        $supDairy = Supplier::create([
            'name' => 'Golden Valley Dairy Farms',
            'contact_person' => 'Elena Rostova',
            'email' => 'orders@goldenvalleydairy.com',
            'phone' => '+1 (555) 890-4411',
            'address' => '88 Farmhouse Lane, Green Valley',
            'notes' => 'Grade-A fresh milk, unsalted cultured butter, heavy cream.',
        ]);

        $supSweet = Supplier::create([
            'name' => 'Sweet Harvest Sugars & Syrups',
            'contact_person' => 'David Chen',
            'email' => 'sales@sweetharvest.com',
            'phone' => '+1 (555) 456-7890',
            'address' => '12 Sugarhouse Blvd, Refinery District',
            'notes' => 'Refined cane sugar, powdered sugar, organic agave, molasses.',
        ]);

        $supCocoa = Supplier::create([
            'name' => 'Belgian Royal Chocolatiers & Spices',
            'contact_person' => 'Henri Dupont',
            'email' => 'contact@belgianroyal.com',
            'phone' => '+1 (555) 332-9011',
            'address' => '500 Harbor View Blvd, Port Terminal',
            'notes' => '70% Dutch dark cocoa powder, chocolate blocks, Madagascar vanilla.',
        ]);

        // 3. Raw Ingredients (both main store and kitchen stock)
        $ingredientsData = [
            [
                'name' => 'All-Purpose Wheat Flour',
                'sku' => 'ING-FLOUR-01',
                'category' => 'Flour & Grains',
                'unit' => 'kg',
                'main_store_stock' => 150.000,
                'kitchen_stock' => 45.000,
                'minimum_alert_level' => 15.000,
                'cost_per_unit' => 1.80,
                'description' => 'Unbleached high-protein all-purpose baking flour.',
            ],
            [
                'name' => 'Granulated White Sugar',
                'sku' => 'ING-SUGAR-01',
                'category' => 'Sweeteners',
                'unit' => 'kg',
                'main_store_stock' => 100.000,
                'kitchen_stock' => 30.000,
                'minimum_alert_level' => 10.000,
                'cost_per_unit' => 2.10,
                'description' => 'Fine grain pure cane granulated sugar.',
            ],
            [
                'name' => 'Unsalted Butter',
                'sku' => 'ING-BUTTER-01',
                'category' => 'Dairy & Fats',
                'unit' => 'kg',
                'main_store_stock' => 60.000,
                'kitchen_stock' => 18.500,
                'minimum_alert_level' => 8.000,
                'cost_per_unit' => 7.50,
                'description' => '82% butterfat European-style cultured unsalted butter.',
            ],
            [
                'name' => 'Whole Farm Milk',
                'sku' => 'ING-MILK-01',
                'category' => 'Dairy & Fats',
                'unit' => 'liter',
                'main_store_stock' => 80.000,
                'kitchen_stock' => 24.000,
                'minimum_alert_level' => 8.000,
                'cost_per_unit' => 1.60,
                'description' => 'Pasteurized whole fresh dairy milk.',
            ],
            [
                'name' => 'Fresh Farm Eggs',
                'sku' => 'ING-EGGS-01',
                'category' => 'Dairy & Fats',
                'unit' => 'pcs',
                'main_store_stock' => 450.000,
                'kitchen_stock' => 120.000,
                'minimum_alert_level' => 40.000,
                'cost_per_unit' => 0.35,
                'description' => 'Grade-A large fresh brown chicken eggs.',
            ],
            [
                'name' => 'Belgian Dark Cocoa Powder',
                'sku' => 'ING-COCOA-01',
                'category' => 'Chocolates & Cocoa',
                'unit' => 'kg',
                'main_store_stock' => 35.000,
                'kitchen_stock' => 12.000,
                'minimum_alert_level' => 4.000,
                'cost_per_unit' => 14.20,
                'description' => '100% Dutch-processed alkalized premium dark cocoa powder.',
            ],
            [
                'name' => 'Heavy Whipping Cream 36%',
                'sku' => 'ING-CREAM-01',
                'category' => 'Dairy & Fats',
                'unit' => 'liter',
                'main_store_stock' => 40.000,
                'kitchen_stock' => 14.000,
                'minimum_alert_level' => 6.000,
                'cost_per_unit' => 6.80,
                'description' => 'Rich 36% whipping cream for mousse and ganache.',
            ],
            [
                'name' => 'Philadelphia Cream Cheese',
                'sku' => 'ING-CHEESE-01',
                'category' => 'Dairy & Fats',
                'unit' => 'kg',
                'main_store_stock' => 30.000,
                'kitchen_stock' => 10.000,
                'minimum_alert_level' => 5.000,
                'cost_per_unit' => 8.50,
                'description' => 'Full-fat smooth block cream cheese for artisan cheesecakes.',
            ],
            [
                'name' => 'Fresh Organic Strawberries',
                'sku' => 'ING-STRAW-01',
                'category' => 'Fruits & Flavors',
                'unit' => 'kg',
                'main_store_stock' => 20.000,
                'kitchen_stock' => 6.500,
                'minimum_alert_level' => 3.000,
                'cost_per_unit' => 8.00,
                'description' => 'Fresh sweet strawberries for fruit tarts and cake layers.',
            ],
            [
                'name' => 'Pure Madagascar Vanilla Extract',
                'sku' => 'ING-VANILLA-01',
                'category' => 'Fruits & Flavors',
                'unit' => 'liter',
                'main_store_stock' => 8.000,
                'kitchen_stock' => 2.500,
                'minimum_alert_level' => 1.000,
                'cost_per_unit' => 48.00,
                'description' => 'Double-fold pure bourbon vanilla bean extract.',
            ],
            [
                'name' => 'Double-Acting Baking Powder',
                'sku' => 'ING-BAKING-01',
                'category' => 'Leavening & Flavoring',
                'unit' => 'kg',
                'main_store_stock' => 25.000,
                'kitchen_stock' => 7.000,
                'minimum_alert_level' => 2.000,
                'cost_per_unit' => 4.50,
                'description' => 'Aluminum-free double acting baking powder.',
            ],
            [
                'name' => 'Powdered Confectioner Sugar',
                'sku' => 'ING-ICING-01',
                'category' => 'Sweeteners',
                'unit' => 'kg',
                'main_store_stock' => 40.000,
                'kitchen_stock' => 12.000,
                'minimum_alert_level' => 5.000,
                'cost_per_unit' => 2.60,
                'description' => 'Ultra-fine 10x powdered sugar for silky frostings.',
            ],
        ];

        $ingredients = [];
        foreach ($ingredientsData as $ing) {
            $ingredients[$ing['sku']] = Ingredient::create($ing);
        }

        // 4. Record Sample Incoming Supplies (Admin supplies intake)
        IngredientSupply::create([
            'supplier_id' => $supFlour->id,
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'quantity' => 100.000,
            'unit_cost' => 1.80,
            'total_cost' => 180.00,
            'batch_number' => 'SUP-20260901-01',
            'expiry_date' => Carbon::now()->addMonths(6),
            'received_by' => $admin->id,
            'notes' => 'Received high grade wheat flour pallets.',
        ]);

        IngredientSupply::create([
            'supplier_id' => $supDairy->id,
            'ingredient_id' => $ingredients['ING-BUTTER-01']->id,
            'quantity' => 40.000,
            'unit_cost' => 7.50,
            'total_cost' => 300.00,
            'batch_number' => 'SUP-20260902-04',
            'expiry_date' => Carbon::now()->addMonths(2),
            'received_by' => $admin->id,
            'notes' => 'Refrigerated delivery confirmed at 4 degrees C.',
        ]);

        // 5. Record Sample Admin Kitchen Allocations
        KitchenAllocation::create([
            'allocation_code' => 'K-ALLOC-20260910-001',
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'quantity' => 25.000,
            'allocated_by' => $admin->id,
            'notes' => 'Dispatched to kitchen for weekend baking run.',
            'allocated_at' => Carbon::now()->subDays(2),
        ]);

        KitchenAllocation::create([
            'allocation_code' => 'K-ALLOC-20260910-002',
            'ingredient_id' => $ingredients['ING-BUTTER-01']->id,
            'quantity' => 10.000,
            'allocated_by' => $admin->id,
            'notes' => 'Croissant and cake butter allocation.',
            'allocated_at' => Carbon::now()->subDays(2),
        ]);

        // 6. Products (Finished pastries / cakes)
        $pChocolateCake = Product::create([
            'name' => 'Chocolate Fudge Cake (8-Inch)',
            'sku' => 'PRD-CAKE-CHOC',
            'category' => 'Cakes',
            'description' => 'Decadent multi-layered Belgian dark chocolate sponge cake with rich ganache frosting.',
            'selling_price' => 32.00,
            'estimated_cost' => 7.85,
            'current_display_stock' => 6, // ready to sell at sales counter
            'kitchen_ready_stock' => 3,   // baked in kitchen
            'shelf_life_days' => 4,
            'image_url' => 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $pStrawberryCake = Product::create([
            'name' => 'Strawberry Vanilla Layer Cake',
            'sku' => 'PRD-CAKE-STRAW',
            'category' => 'Cakes',
            'description' => 'Light vanilla chiffon layers with fresh strawberries and whipped cream.',
            'selling_price' => 35.00,
            'estimated_cost' => 8.40,
            'current_display_stock' => 4,
            'kitchen_ready_stock' => 2,
            'shelf_life_days' => 3,
            'image_url' => 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $pCroissant = Product::create([
            'name' => 'Artisan Butter Croissant (6-Pack)',
            'sku' => 'PRD-PAS-CROIS',
            'category' => 'Pastries',
            'description' => 'Flaky 27-layer laminated French butter croissants, golden-baked.',
            'selling_price' => 18.00,
            'estimated_cost' => 4.20,
            'current_display_stock' => 12,
            'kitchen_ready_stock' => 6,
            'shelf_life_days' => 2,
            'image_url' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $pCheesecake = Product::create([
            'name' => 'New York Creamy Cheesecake',
            'sku' => 'PRD-CAKE-CHSE',
            'category' => 'Cakes',
            'description' => 'Dense, ultra-smooth classic baked cheesecake on graham crust.',
            'selling_price' => 38.00,
            'estimated_cost' => 9.75,
            'current_display_stock' => 5,
            'kitchen_ready_stock' => 2,
            'shelf_life_days' => 5,
            'image_url' => 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        $pCaramelTart = Product::create([
            'name' => 'Salted Caramel Pecan Tart',
            'sku' => 'PRD-TART-CARAM',
            'category' => 'Pastries',
            'description' => 'Crisp sable shell filled with dark sea salt caramel and roasted pecans.',
            'selling_price' => 22.00,
            'estimated_cost' => 5.60,
            'current_display_stock' => 0,
            'kitchen_ready_stock' => 0,
            'shelf_life_days' => 4,
            'image_url' => 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&auto=format&fit=crop&q=80',
            'is_active' => true,
        ]);

        // 7. Approved Recipes (BOM) created by Chef, Approved by Admin
        // Recipe 1: Chocolate Fudge Cake
        $recChoc = Recipe::create([
            'product_id' => $pChocolateCake->id,
            'version' => 1,
            'batch_yield' => 1, // 1 cake
            'prep_time_minutes' => 60,
            'instructions' => 'Sift cocoa and flour. Cream butter with sugar. Fold eggs and milk. Bake at 175C for 35 mins.',
            'status' => 'approved',
            'created_by' => $chef->id,
            'approved_by' => $admin->id,
            'approved_at' => Carbon::now()->subDays(10),
            'admin_feedback' => 'Approved. Excellent standard cost structure and yield ratio.',
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recChoc->id,
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'quantity_required' => 0.500, // 0.5 kg flour
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChoc->id,
            'ingredient_id' => $ingredients['ING-SUGAR-01']->id,
            'quantity_required' => 0.400, // 0.4 kg sugar
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChoc->id,
            'ingredient_id' => $ingredients['ING-BUTTER-01']->id,
            'quantity_required' => 0.300, // 0.3 kg butter
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChoc->id,
            'ingredient_id' => $ingredients['ING-COCOA-01']->id,
            'quantity_required' => 0.200, // 0.2 kg cocoa
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChoc->id,
            'ingredient_id' => $ingredients['ING-EGGS-01']->id,
            'quantity_required' => 4.000, // 4 eggs
            'unit' => 'pcs',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChoc->id,
            'ingredient_id' => $ingredients['ING-MILK-01']->id,
            'quantity_required' => 0.250, // 0.25 liter milk
            'unit' => 'liter',
        ]);

        // Recipe 2: Strawberry Vanilla Cake
        $recStraw = Recipe::create([
            'product_id' => $pStrawberryCake->id,
            'version' => 1,
            'batch_yield' => 1,
            'prep_time_minutes' => 75,
            'instructions' => 'Whip egg whites for fluffy chiffon. Fold pure vanilla and strawberry puree. Chill before icing.',
            'status' => 'approved',
            'created_by' => $chef->id,
            'approved_by' => $admin->id,
            'approved_at' => Carbon::now()->subDays(8),
            'admin_feedback' => 'Approved. Consistent strawberry usage.',
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recStraw->id,
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'quantity_required' => 0.450,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recStraw->id,
            'ingredient_id' => $ingredients['ING-SUGAR-01']->id,
            'quantity_required' => 0.350,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recStraw->id,
            'ingredient_id' => $ingredients['ING-BUTTER-01']->id,
            'quantity_required' => 0.250,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recStraw->id,
            'ingredient_id' => $ingredients['ING-EGGS-01']->id,
            'quantity_required' => 4.000,
            'unit' => 'pcs',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recStraw->id,
            'ingredient_id' => $ingredients['ING-CREAM-01']->id,
            'quantity_required' => 0.300,
            'unit' => 'liter',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recStraw->id,
            'ingredient_id' => $ingredients['ING-STRAW-01']->id,
            'quantity_required' => 0.400,
            'unit' => 'kg',
        ]);

        // Recipe 3: Butter Croissant
        $recCrois = Recipe::create([
            'product_id' => $pCroissant->id,
            'version' => 1,
            'batch_yield' => 1, // 1 pack of 6
            'prep_time_minutes' => 120,
            'instructions' => 'Laminate dough with cold butter block. 3 turns. Proof 2 hours at 26C. Bake at 200C for 18 mins.',
            'status' => 'approved',
            'created_by' => $chef->id,
            'approved_by' => $admin->id,
            'approved_at' => Carbon::now()->subDays(6),
            'admin_feedback' => 'Approved.',
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recCrois->id,
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'quantity_required' => 0.600,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recCrois->id,
            'ingredient_id' => $ingredients['ING-BUTTER-01']->id,
            'quantity_required' => 0.350,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recCrois->id,
            'ingredient_id' => $ingredients['ING-MILK-01']->id,
            'quantity_required' => 0.200,
            'unit' => 'liter',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recCrois->id,
            'ingredient_id' => $ingredients['ING-EGGS-01']->id,
            'quantity_required' => 2.000,
            'unit' => 'pcs',
        ]);

        // Recipe 4: New York Cheesecake
        $recChse = Recipe::create([
            'product_id' => $pCheesecake->id,
            'version' => 1,
            'batch_yield' => 1,
            'prep_time_minutes' => 90,
            'instructions' => 'Blend cream cheese and sugar slowly to avoid air. Add eggs one by one. Water bath bake at 150C.',
            'status' => 'approved',
            'created_by' => $chef->id,
            'approved_by' => $admin->id,
            'approved_at' => Carbon::now()->subDays(5),
            'admin_feedback' => 'Approved.',
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recChse->id,
            'ingredient_id' => $ingredients['ING-CHEESE-01']->id,
            'quantity_required' => 0.800,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChse->id,
            'ingredient_id' => $ingredients['ING-SUGAR-01']->id,
            'quantity_required' => 0.300,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChse->id,
            'ingredient_id' => $ingredients['ING-EGGS-01']->id,
            'quantity_required' => 3.000,
            'unit' => 'pcs',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recChse->id,
            'ingredient_id' => $ingredients['ING-CREAM-01']->id,
            'quantity_required' => 0.200,
            'unit' => 'liter',
        ]);

        // Recipe 5: PENDING RECIPE (Created by Chef, Waiting for Admin Approval)
        $recPending = Recipe::create([
            'product_id' => $pCaramelTart->id,
            'version' => 1,
            'batch_yield' => 1,
            'prep_time_minutes' => 45,
            'instructions' => 'Blind bake sweet pastry shell. Cook sugar to amber caramel. Whisk in hot cream and butter. Pour and set.',
            'status' => 'pending_approval',
            'created_by' => $chef->id,
            'approved_by' => null,
            'approved_at' => null,
            'admin_feedback' => null,
        ]);

        RecipeIngredient::create([
            'recipe_id' => $recPending->id,
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'quantity_required' => 0.300,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recPending->id,
            'ingredient_id' => $ingredients['ING-SUGAR-01']->id,
            'quantity_required' => 0.350,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recPending->id,
            'ingredient_id' => $ingredients['ING-BUTTER-01']->id,
            'quantity_required' => 0.200,
            'unit' => 'kg',
        ]);
        RecipeIngredient::create([
            'recipe_id' => $recPending->id,
            'ingredient_id' => $ingredients['ING-CREAM-01']->id,
            'quantity_required' => 0.250,
            'unit' => 'liter',
        ]);

        // 8. Historical Production Batches & Ingredient Usage
        $batch1 = ProductionBatch::create([
            'batch_code' => 'BATCH-20260914-001',
            'product_id' => $pChocolateCake->id,
            'recipe_id' => $recChoc->id,
            'chef_id' => $chef->id,
            'planned_quantity' => 10,
            'actual_quantity' => 10,
            'yield_efficiency_percent' => 100.00,
            'status' => 'completed',
            'started_at' => Carbon::now()->subDays(1)->setHour(8),
            'completed_at' => Carbon::now()->subDays(1)->setHour(11),
            'notes' => 'Perfect morning baking run. 10 units produced at 100% efficiency.',
        ]);

        BatchIngredientUsage::create([
            'production_batch_id' => $batch1->id,
            'ingredient_id' => $ingredients['ING-FLOUR-01']->id,
            'standard_quantity' => 5.000,
            'actual_quantity' => 5.000,
            'variance' => 0.000,
        ]);
        BatchIngredientUsage::create([
            'production_batch_id' => $batch1->id,
            'ingredient_id' => $ingredients['ING-COCOA-01']->id,
            'standard_quantity' => 2.000,
            'actual_quantity' => 2.000,
            'variance' => 0.000,
        ]);

        $batch2 = ProductionBatch::create([
            'batch_code' => 'BATCH-20260915-002',
            'product_id' => $pCroissant->id,
            'recipe_id' => $recCrois->id,
            'chef_id' => $chef->id,
            'planned_quantity' => 15,
            'actual_quantity' => 14,
            'yield_efficiency_percent' => 93.33,
            'status' => 'completed',
            'started_at' => Carbon::now()->subHours(6),
            'completed_at' => Carbon::now()->subHours(3),
            'notes' => '1 batch trimmed during lamination dough folding. 14 good packs.',
        ]);

        // 9. Product Transfers (Chef to Sales)
        ProductTransfer::create([
            'transfer_code' => 'TRF-20260914-001',
            'product_id' => $pChocolateCake->id,
            'quantity' => 7,
            'chef_id' => $chef->id,
            'sales_id' => $sales->id,
            'status' => 'received',
            'transferred_at' => Carbon::now()->subDays(1)->setHour(12),
            'received_at' => Carbon::now()->subDays(1)->setHour(12)->addMinutes(15),
            'notes' => 'Transferred 7 chilled chocolate cakes to front display.',
        ]);

        ProductTransfer::create([
            'transfer_code' => 'TRF-20260915-002',
            'product_id' => $pCroissant->id,
            'quantity' => 8,
            'chef_id' => $chef->id,
            'sales_id' => null,
            'status' => 'pending',
            'transferred_at' => Carbon::now()->subMinutes(30),
            'received_at' => null,
            'notes' => 'Fresh warm croissants transferred, waiting for cashier acknowledgement.',
        ]);

        // 10. Sample Sales Orders
        $order1 = SalesOrder::create([
            'order_number' => 'ORD-20260915-001',
            'cashier_id' => $sales->id,
            'customer_name' => 'Alice Johnson',
            'customer_phone' => '+1 555-908-1122',
            'subtotal' => 64.00,
            'discount' => 0.00,
            'tax' => 5.12,
            'total_amount' => 69.12,
            'payment_method' => 'card',
            'status' => 'completed',
            'notes' => 'Birthday cake order.',
        ]);

        SalesOrderItem::create([
            'sales_order_id' => $order1->id,
            'product_id' => $pChocolateCake->id,
            'quantity' => 2,
            'unit_price' => 32.00,
            'subtotal' => 64.00,
        ]);

        $order2 = SalesOrder::create([
            'order_number' => 'ORD-20260915-002',
            'cashier_id' => $sales->id,
            'customer_name' => 'Walk-in Customer',
            'customer_phone' => null,
            'subtotal' => 36.00,
            'discount' => 0.00,
            'tax' => 2.88,
            'total_amount' => 38.88,
            'payment_method' => 'cash',
            'status' => 'completed',
            'notes' => 'Counter breakfast takeaway.',
        ]);

        SalesOrderItem::create([
            'sales_order_id' => $order2->id,
            'product_id' => $pCroissant->id,
            'quantity' => 2,
            'unit_price' => 18.00,
            'subtotal' => 36.00,
        ]);

        // 11. Sample Wastage Records (Critical logic: Raw, Kitchen, Counter)
        // A. Raw Material Wastage in Kitchen (With Lost Cake Calculations!)
        // 1.5 kg cocoa spilled in kitchen pantry
        Wastage::create([
            'tracking_code' => 'WASTE-20260913-001',
            'stage' => 'raw_material',
            'ingredient_id' => $ingredients['ING-COCOA-01']->id,
            'product_id' => null,
            'quantity' => 1.500,
            'unit' => 'kg',
            'cost_loss' => round(1.500 * 14.20, 2), // $21.30
            'potential_product_loss_qty' => 7,      // 1.5kg / 0.2kg per chocolate cake = 7 cakes lost!
            'reason' => 'spilled_damaged',
            'reported_by' => $chef->id,
            'notes' => 'Container dropped during morning pantry prep. Recalculated -7 chocolate cakes potential.',
        ]);

        // 3.0 liters milk expired
        Wastage::create([
            'tracking_code' => 'WASTE-20260914-002',
            'stage' => 'raw_material',
            'ingredient_id' => $ingredients['ING-MILK-01']->id,
            'product_id' => null,
            'quantity' => 3.000,
            'unit' => 'liter',
            'cost_loss' => round(3.000 * 1.60, 2),
            'potential_product_loss_qty' => 12, // 3L / 0.25L = 12 cakes lost
            'reason' => 'expired',
            'reported_by' => $chef->id,
            'notes' => 'Milk soured past shelf life in kitchen prep fridge.',
        ]);

        // B. Kitchen In-Process Wastage
        Wastage::create([
            'tracking_code' => 'WASTE-20260914-003',
            'stage' => 'kitchen_production',
            'ingredient_id' => null,
            'product_id' => $pChocolateCake->id,
            'quantity' => 1.000,
            'unit' => 'pcs',
            'cost_loss' => 7.85,
            'potential_product_loss_qty' => 1,
            'reason' => 'burned_overbaked',
            'reported_by' => $chef->id,
            'notes' => 'Oven timer miscalibrated by apprentice; bottom tier scorched.',
        ]);

        // C. Sales Counter Wastage (Unsold Expiry)
        Wastage::create([
            'tracking_code' => 'WASTE-20260915-004',
            'stage' => 'sales_counter',
            'ingredient_id' => null,
            'product_id' => $pCroissant->id,
            'quantity' => 2.000,
            'unit' => 'pcs',
            'cost_loss' => 8.40,
            'potential_product_loss_qty' => 2,
            'reason' => 'expired',
            'reported_by' => $sales->id,
            'notes' => 'Unsold croissants reached 48-hour shelf-life limit at closing.',
        ]);
    }
}
