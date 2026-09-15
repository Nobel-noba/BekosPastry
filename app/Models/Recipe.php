<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'version',
        'batch_yield',
        'prep_time_minutes',
        'instructions',
        'status', // draft, pending_approval, approved, rejected
        'created_by',
        'approved_by',
        'approved_at',
        'admin_feedback',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
            'batch_yield' => 'integer',
            'prep_time_minutes' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    public function productionBatches(): HasMany
    {
        return $this->hasMany(ProductionBatch::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function calculateTotalCost(): float
    {
        $cost = 0;
        foreach ($this->ingredients as $ri) {
            $cost += (float) $ri->quantity_required * (float) ($ri->ingredient->cost_per_unit ?? 0);
        }

        return round($cost, 2);
    }
}
