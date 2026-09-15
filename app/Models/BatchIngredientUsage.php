<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchIngredientUsage extends Model
{
    use HasFactory;

    protected $fillable = [
        'production_batch_id',
        'ingredient_id',
        'standard_quantity',
        'actual_quantity',
        'variance',
    ];

    protected function casts(): array
    {
        return [
            'standard_quantity' => 'decimal:4',
            'actual_quantity' => 'decimal:4',
            'variance' => 'decimal:4',
        ];
    }

    public function productionBatch(): BelongsTo
    {
        return $this->belongsTo(ProductionBatch::class);
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }
}
