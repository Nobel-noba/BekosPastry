<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ingredient extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category',
        'unit',
        'main_store_stock',
        'kitchen_stock',
        'minimum_alert_level',
        'cost_per_unit',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'main_store_stock' => 'decimal:3',
            'kitchen_stock' => 'decimal:3',
            'minimum_alert_level' => 'decimal:3',
            'cost_per_unit' => 'decimal:2',
        ];
    }

    public function supplies(): HasMany
    {
        return $this->hasMany(IngredientSupply::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(KitchenAllocation::class);
    }

    public function recipeIngredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function batchUsages(): HasMany
    {
        return $this->hasMany(BatchIngredientUsage::class);
    }

    public function wastages(): HasMany
    {
        return $this->hasMany(Wastage::class);
    }

    /**
     * Check if kitchen stock is low
     */
    public function isKitchenStockLow(): bool
    {
        return (float) $this->kitchen_stock <= (float) $this->minimum_alert_level;
    }
}
