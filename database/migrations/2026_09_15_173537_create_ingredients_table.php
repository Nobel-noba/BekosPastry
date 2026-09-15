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
        Schema::create('ingredients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('sku')->unique()->nullable();
            $table->string('category')->default('General');
            $table->string('unit')->default('kg'); // kg, g, liter, ml, pcs
            $table->decimal('main_store_stock', 12, 3)->default(0);
            $table->decimal('kitchen_stock', 12, 3)->default(0);
            $table->decimal('minimum_alert_level', 12, 3)->default(5.0);
            $table->decimal('cost_per_unit', 10, 2)->default(0);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ingredients');
    }
};
