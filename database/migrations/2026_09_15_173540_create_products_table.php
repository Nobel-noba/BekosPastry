<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->string('category')->default('Pastries');
            $table->text('description')->nullable();
            $table->decimal('selling_price', 10, 2);
            $table->decimal('estimated_cost', 10, 2)->default(0);
            $table->integer('current_display_stock')->default(0); // at sales counter
            $table->integer('kitchen_ready_stock')->default(0);    // in kitchen finished holding
            $table->integer('shelf_life_days')->default(3);
            $table->string('image_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
