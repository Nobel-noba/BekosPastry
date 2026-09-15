<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class KitchenAllocation extends Model
{
    use HasFactory;

    protected $fillable = [
        'allocation_code',
        'ingredient_id',
        'quantity',
        'allocated_by',
        'notes',
        'allocated_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'allocated_at' => 'datetime',
        ];
    }

    public function ingredient(): BelongsTo
    {
        return $this->belongsTo(Ingredient::class);
    }

    public function allocator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'allocated_by');
    }
}
