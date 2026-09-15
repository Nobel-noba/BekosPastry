<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Wastage extends Model
{
    use HasFactory;

    protected $fillable = [
        'tracking_code',
        'stage', // raw_material, kitchen_production, sales_counter
        'ingredient_id',
        'product_id',
        'quantity',
        'unit',
        'cost_loss',
        'potential_product_loss_qty',
        'reason',
        'reported_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'cost_loss' => 'decimal:2',
            'potential_product_loss_qty' => 'integer',
        ];
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Calculate how many potential cakes were lost given a wasted ingredient quantity.
     * Evaluates recipes using this ingredient to find representative or highest impact.
     */
    public static function calculatePotentialCakeLoss(?int $ingredientId, float $wastedQty): int
    {
        if (! $ingredientId || $wastedQty <= 0) {
            return 0;
        }

        // Find approved recipes using this ingredient
        $recipeIngredients = RecipeIngredient::where('ingredient_id', $ingredientId)
            ->whereHas('recipe', function ($query) {
                $query->where('status', 'approved');
            })
            ->get();

        if ($recipeIngredients->isEmpty()) {
            return 0;
        }

        $maxLostCakes = 0;
        foreach ($recipeIngredients as $ri) {
            $requiredPerCake = (float) $ri->quantity_required;
            if ($requiredPerCake > 0) {
                $lostCakes = (int) floor($wastedQty / $requiredPerCake);
                if ($lostCakes > $maxLostCakes) {
                    $maxLostCakes = $lostCakes;
                }
            }
        }

        return $maxLostCakes;
    }
}
