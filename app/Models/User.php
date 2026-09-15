<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'phone', 'status'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isChef(): bool
    {
        return $this->role === 'chef';
    }

    public function isSales(): bool
    {
        return $this->role === 'sales';
    }

    public function productionBatches(): HasMany
    {
        return $this->hasMany(ProductionBatch::class, 'chef_id');
    }

    public function createdRecipes(): HasMany
    {
        return $this->hasMany(Recipe::class, 'created_by');
    }

    public function salesOrders(): HasMany
    {
        return $this->hasMany(SalesOrder::class, 'cashier_id');
    }

    public function reportedWastages(): HasMany
    {
        return $this->hasMany(Wastage::class, 'reported_by');
    }
}
