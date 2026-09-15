<?php

namespace Tests\Feature;

use App\Models\Ingredient;
use App\Models\Product;
use App\Models\ProductTransfer;
use App\Models\Recipe;
use App\Models\User;
use App\Models\Wastage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PastryWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_quick_login_redirects_to_proper_role_dashboard(): void
    {
        // 1. Admin login
        $response = $this->get('/quick-login/admin');
        $response->assertRedirect('/admin/dashboard');

        // 2. Chef login
        $response = $this->get('/quick-login/chef');
        $response->assertRedirect('/chef/dashboard');

        // 3. Sales login
        $response = $this->get('/quick-login/sales');
        $response->assertRedirect('/sales/dashboard');
    }

    public function test_admin_can_view_supplies_page(): void
    {
        $admin = User::where('role', 'admin')->first();

        $response = $this->actingAs($admin)->get('/admin/supplies');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Supplies')
            ->has('ingredients')
            ->has('suppliers')
            ->has('recent_supplies')
            ->has('recent_allocations')
        );
    }

    public function test_admin_can_add_supplier(): void
    {
        $admin = User::where('role', 'admin')->first();

        $response = $this->actingAs($admin)->post('/admin/suppliers', [
            'name' => 'Royal Dairy Farms',
            'contact_person' => 'Emma Watson',
            'email' => 'emma@royaldairy.com',
            'phone' => '+1 555-0987',
            'address' => '10 Pasture Way, Countryside',
            'notes' => 'Fresh butter and cream daily provider',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('suppliers', [
            'name' => 'Royal Dairy Farms',
            'email' => 'emma@royaldairy.com',
        ]);
    }

    public function test_admin_can_add_ingredient(): void
    {
        $admin = User::where('role', 'admin')->first();

        $response = $this->actingAs($admin)->post('/admin/ingredients', [
            'name' => 'Matcha Green Tea Powder',
            'category' => 'Flavorings & Extracts',
            'unit' => 'kg',
            'main_store_stock' => 5,
            'kitchen_stock' => 1,
            'minimum_alert_level' => 2,
            'cost_per_unit' => 45.00,
            'description' => 'Ceremonial grade Uji matcha',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('ingredients', [
            'name' => 'Matcha Green Tea Powder',
            'category' => 'Flavorings & Extracts',
            'unit' => 'kg',
        ]);
    }

    public function test_admin_can_allocate_ingredients_to_kitchen(): void
    {
        $admin = User::where('role', 'admin')->first();
        $ingredient = Ingredient::where('name', 'All-Purpose Wheat Flour')->first();

        $initialMainStore = (float) $ingredient->main_store_stock;
        $initialKitchen = (float) $ingredient->kitchen_stock;

        $response = $this->actingAs($admin)->post('/admin/supplies/allocate', [
            'ingredient_id' => $ingredient->id,
            'quantity' => 10,
            'notes' => 'Allocating 10kg flour for daily batch',
        ]);

        $response->assertSessionHas('success');

        $ingredient->refresh();
        $this->assertEquals($initialMainStore - 10, (float) $ingredient->main_store_stock);
        $this->assertEquals($initialKitchen + 10, (float) $ingredient->kitchen_stock);
    }

    public function test_chef_recipe_requires_admin_approval_before_baking(): void
    {
        $chef = User::where('role', 'chef')->first();
        $admin = User::where('role', 'admin')->first();
        $flour = Ingredient::where('name', 'All-Purpose Wheat Flour')->first();

        // 1. Create new pastry product without approved recipe
        $product = Product::create([
            'name' => 'Blueberry Brioche',
            'category' => 'Pastries',
            'selling_price' => 12.00,
            'current_display_stock' => 0,
            'kitchen_ready_stock' => 0,
            'shelf_life_days' => 2,
            'is_active' => true,
        ]);

        // 2. Chef submits recipe
        $this->actingAs($chef)->post('/chef/recipes', [
            'product_id' => $product->id,
            'batch_yield' => 1,
            'prep_time_minutes' => 45,
            'instructions' => 'Proof dough with butter.',
            'ingredients' => [
                [
                    'ingredient_id' => $flour->id,
                    'quantity_required' => 0.4,
                    'unit' => 'kg',
                ],
            ],
        ]);

        $recipe = Recipe::where('product_id', $product->id)->latest()->first();
        $this->assertEquals('pending_approval', $recipe->status);

        // 3. Chef tries to start batch -> should fail because recipe is NOT approved
        $startResponse = $this->actingAs($chef)->post('/chef/production/start', [
            'product_id' => $product->id,
            'planned_quantity' => 5,
        ]);
        $startResponse->assertSessionHas('error');

        // 4. Admin approves the recipe
        $this->actingAs($admin)->post("/admin/recipes/{$recipe->id}/approve", [
            'admin_feedback' => 'Approved. Ratios look great.',
        ]);

        $recipe->refresh();
        $this->assertEquals('approved', $recipe->status);

        // 5. Chef can now start production batch
        $startSuccessResponse = $this->actingAs($chef)->post('/chef/production/start', [
            'product_id' => $product->id,
            'planned_quantity' => 5,
        ]);
        $startSuccessResponse->assertSessionHas('success');
    }

    public function test_chef_completes_production_batch_with_ingredient_deduction(): void
    {
        $chef = User::where('role', 'chef')->first();
        $product = Product::where('name', 'Chocolate Fudge Cake (8-Inch)')->first();
        $recipe = $product->approvedRecipe;
        $flour = Ingredient::where('name', 'All-Purpose Wheat Flour')->first();

        // Ensure kitchen has enough flour
        $flour->update(['kitchen_stock' => 50.000]);
        $initialKitchenStock = (float) $flour->kitchen_stock;
        $initialReadyStock = $product->kitchen_ready_stock;

        // Start batch of 4 cakes
        $this->actingAs($chef)->post('/chef/production/start', [
            'product_id' => $product->id,
            'planned_quantity' => 4,
        ]);

        $batch = $product->productionBatches()->where('status', 'in_progress')->latest()->first();

        // Complete batch with 4 actual cakes (100% yield)
        $completeResponse = $this->actingAs($chef)->post("/chef/production/{$batch->id}/complete", [
            'actual_quantity' => 4,
            'notes' => '100% efficiency bake',
        ]);

        $completeResponse->assertSessionHas('success');

        $batch->refresh();
        $product->refresh();
        $flour->refresh();

        $this->assertEquals('completed', $batch->status);
        $this->assertEquals(100.00, (float) $batch->yield_efficiency_percent);
        $this->assertEquals($initialReadyStock + 4, $product->kitchen_ready_stock);

        // Recipe uses 0.5kg flour per cake * 4 = 2kg deducted
        $this->assertEquals($initialKitchenStock - 2.0, (float) $flour->kitchen_stock);
    }

    public function test_wastage_deducts_stock_and_calculates_lost_cake_yield(): void
    {
        $chef = User::where('role', 'chef')->first();
        $cocoa = Ingredient::where('name', 'Belgian Dark Cocoa Powder')->first();
        $cocoa->update(['kitchen_stock' => 10.000]);

        // 1.0 kg cocoa wasted. Standard Chocolate Fudge Cake uses 0.2kg cocoa per cake.
        // Expected lost cake yield = 1.0 / 0.2 = 5 cakes!
        $this->actingAs($chef)->post('/chef/wastage', [
            'stage' => 'raw_material',
            'ingredient_id' => $cocoa->id,
            'quantity' => 1.000,
            'reason' => 'spilled_damaged',
            'notes' => 'Pantry jar dropped',
        ]);

        $cocoa->refresh();
        $this->assertEquals(9.000, (float) $cocoa->kitchen_stock);

        $wastage = Wastage::where('ingredient_id', $cocoa->id)->latest('id')->first();
        $this->assertEquals(5, $wastage->potential_product_loss_qty);
        $this->assertEquals(14.20, (float) $wastage->cost_loss);
    }

    public function test_chef_transfers_to_sales_and_sales_checkout(): void
    {
        $chef = User::where('role', 'chef')->first();
        $sales = User::where('role', 'sales')->first();
        $product = Product::where('name', 'Chocolate Fudge Cake (8-Inch)')->first();

        $product->update([
            'kitchen_ready_stock' => 5,
            'current_display_stock' => 2,
        ]);

        // 1. Chef transfers 3 cakes to sales
        $this->actingAs($chef)->post('/chef/transfers', [
            'product_id' => $product->id,
            'quantity' => 3,
            'notes' => 'Sending 3 cakes to counter',
        ]);

        $product->refresh();
        $this->assertEquals(2, $product->kitchen_ready_stock);

        $transfer = ProductTransfer::where('product_id', $product->id)->where('status', 'pending')->latest()->first();

        // 2. Sales cashier receives transfer
        $this->actingAs($sales)->post("/sales/transfers/{$transfer->id}/receive");

        $product->refresh();
        $transfer->refresh();
        $this->assertEquals('received', $transfer->status);
        $this->assertEquals(5, $product->current_display_stock); // 2 previous + 3 transferred = 5

        // 3. Sales cashier completes POS order for 2 cakes
        $checkoutResponse = $this->actingAs($sales)->post('/sales/checkout', [
            'customer_name' => 'John Doe',
            'payment_method' => 'card',
            'discount' => 0,
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 2,
                    'unit_price' => 32.00,
                ],
            ],
        ]);

        $checkoutResponse->assertSessionHas('success');

        $product->refresh();
        $this->assertEquals(3, $product->current_display_stock); // 5 - 2 = 3 left
    }
}
