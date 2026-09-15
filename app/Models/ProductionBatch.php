<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductionBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_code',
        'product_id',
        'recipe_id',
        'chef_id',
        'planned_quantity',
        'actual_quantity',
        'yield_efficiency_percent',
        'status', // in_progress, completed, cancelled
        'started_at',
        'completed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'planned_quantity' => 'integer',
            'actual_quantity' => 'integer',
            'yield_efficiency_percent' => 'decimal:2',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    public function chef(): BelongsTo
    {
        return $this->belongsTo(User::class, 'chef_id');
    }

    public function ingredientUsages(): HasMany
    {
        return $this->hasMany(BatchIngredientUsage::class);
    }
}
