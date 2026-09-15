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
        Schema::create('wastages', function (Blueprint $table) {
            $table->id();
            $table->string('tracking_code')->unique();
            $table->enum('stage', ['raw_material', 'kitchen_production', 'sales_counter']);
            $table->foreignId('ingredient_id')->nullable()->constrained('ingredients')->onDelete('set null');
            $table->foreignId('product_id')->nullable()->constrained('products')->onDelete('set null');
            $table->decimal('quantity', 12, 3);
            $table->string('unit')->default('pcs');
            $table->decimal('cost_loss', 10, 2)->default(0);
            $table->integer('potential_product_loss_qty')->nullable()->default(0); // Estimated cakes lost due to this ingredient wastage
            $table->string('reason'); // expired, spilled_damaged, burned_overbaked, temperature_failure, quality_rejection, other
            $table->foreignId('reported_by')->constrained('users')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wastages');
    }
};
