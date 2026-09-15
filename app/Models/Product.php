<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category',
        'description',
        'selling_price',
        'estimated_cost',
        'current_display_stock',
        'kitchen_ready_stock',
        'shelf_life_days',
        'image_url',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'selling_price' => 'decimal:2',
            'estimated_cost' => 'decimal:2',
            'current_display_stock' => 'integer',
            'kitchen_ready_stock' => 'integer',
            'shelf_life_days' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function recipes(): HasMany
    {
        return $this->hasMany(Recipe::class);
    }

    public function approvedRecipe(): HasOne
    {
        return $this->hasOne(Recipe::class)->where('status', 'approved')->latestOfMany();
    }

    public function productionBatches(): HasMany
    {
        return $this->hasMany(ProductionBatch::class);
    }

    public function transfers(): HasMany
    {
        return $this->hasMany(ProductTransfer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(SalesOrderItem::class);
    }

    public function wastages(): HasMany
    {
        return $this->hasMany(Wastage::class);
    }

    /**
     * Calculate how many cakes can be made right now from available kitchen pantry stock.
     * Based on bottleneck ingredient in the approved recipe.
     */
    public function calculatePossibleBatches(): int
    {
        $recipe = $this->approvedRecipe;
        if (! $recipe || $recipe->ingredients->isEmpty()) {
            return 0;
        }

        $minPossible = PHP_INT_MAX;

        foreach ($recipe->ingredients as $recipeIngredient) {
            $requiredPerCake = (float) $recipeIngredient->quantity_required;
            if ($requiredPerCake <= 0) {
                continue;
            }

            $currentKitchenStock = (float) $recipeIngredient->ingredient->kitchen_stock;
            $possible = (int) floor($currentKitchenStock / $requiredPerCake);

            if ($possible < $minPossible) {
                $minPossible = $possible;
            }
        }

        return $minPossible === PHP_INT_MAX ? 0 : $minPossible;
    }
}
