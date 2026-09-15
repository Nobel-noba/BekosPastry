<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ChefController;
use App\Http\Controllers\SalesController;
use Illuminate\Support\Facades\Route;

// Guest & Authentication
Route::get('/', function () {
    if (auth()->check()) {
        return match (auth()->user()->role) {
            'admin' => redirect()->route('admin.dashboard'),
            'chef' => redirect()->route('chef.dashboard'),
            'sales' => redirect()->route('sales.dashboard'),
            default => redirect()->route('login'),
        };
    }

    return redirect()->route('login');
});

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/quick-login/{role}', [AuthController::class, 'quickLogin'])->name('quick-login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// 1. Administrator Routes
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('dashboard');

    // Supplies & Kitchen Allocation
    Route::get('/supplies', [AdminController::class, 'supplies'])->name('supplies');
    Route::post('/supplies', [AdminController::class, 'storeSupply'])->name('supplies.store');
    Route::post('/supplies/allocate', [AdminController::class, 'allocateToKitchen'])->name('supplies.allocate');
    Route::post('/suppliers', [AdminController::class, 'storeSupplier'])->name('suppliers.store');
    Route::post('/ingredients', [AdminController::class, 'storeIngredient'])->name('ingredients.store');

    // Recipes Approval Center
    Route::get('/recipes', [AdminController::class, 'recipes'])->name('recipes');
    Route::post('/recipes/{recipe}/approve', [AdminController::class, 'approveRecipe'])->name('recipes.approve');
    Route::post('/recipes/{recipe}/reject', [AdminController::class, 'rejectRecipe'])->name('recipes.reject');

    // Products Management
    Route::get('/products', [AdminController::class, 'products'])->name('products');
    Route::post('/products', [AdminController::class, 'storeProduct'])->name('products.store');

    // Wastage Audit
    Route::get('/wastage', [AdminController::class, 'wastage'])->name('wastage');

    // Staff & Users Management
    Route::get('/users', [AdminController::class, 'users'])->name('users');
    Route::post('/users', [AdminController::class, 'storeUser'])->name('users.store');
});

// 2. Chef Routes
Route::middleware(['auth', 'role:chef'])->prefix('chef')->name('chef.')->group(function () {
    Route::get('/dashboard', [ChefController::class, 'dashboard'])->name('dashboard');

    // Recipe Formulation (Chef submits, Admin approves)
    Route::get('/recipes', [ChefController::class, 'recipes'])->name('recipes');
    Route::post('/recipes', [ChefController::class, 'storeRecipe'])->name('recipes.store');

    // Batch Production (Locked strictly to Approved Recipes)
    Route::get('/production', [ChefController::class, 'production'])->name('production');
    Route::post('/production/start', [ChefController::class, 'startBatch'])->name('production.start');
    Route::post('/production/{batch}/complete', [ChefController::class, 'completeBatch'])->name('production.complete');

    // Product Transfers to Sales Counter
    Route::get('/transfers', [ChefController::class, 'transfers'])->name('transfers');
    Route::post('/transfers', [ChefController::class, 'storeTransfer'])->name('transfers.store');

    // Wastage Logging (Raw material with cake loss or ruined bake)
    Route::get('/wastage', [ChefController::class, 'wastage'])->name('wastage');
    Route::post('/wastage', [ChefController::class, 'storeWastage'])->name('wastage.store');
});

// 3. Sales Routes
Route::middleware(['auth', 'role:sales'])->prefix('sales')->name('sales.')->group(function () {
    Route::get('/dashboard', fn () => redirect()->route('sales.pos'))->name('dashboard');

    // POS Counter Terminal
    Route::get('/pos', [SalesController::class, 'pos'])->name('pos');
    Route::post('/checkout', [SalesController::class, 'checkout'])->name('checkout');

    // Incoming Kitchen Transfers
    Route::get('/transfers', [SalesController::class, 'transfers'])->name('transfers');
    Route::post('/transfers/{transfer}/receive', [SalesController::class, 'receiveTransfer'])->name('transfers.receive');

    // Counter Wastage / Expiry
    Route::get('/wastage', [SalesController::class, 'wastage'])->name('wastage');
    Route::post('/wastage', [SalesController::class, 'storeWastage'])->name('wastage.store');

    // Daily Shift Report
    Route::get('/shift-report', [SalesController::class, 'shiftReport'])->name('shift-report');
});
