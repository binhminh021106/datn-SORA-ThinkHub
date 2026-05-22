<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'fullName',
        'email',
        'phone',
        'password',
        'avatar_url',
        'status',
        'birthday',
        'gender',
        'google_id',
        'facebook_id',
        'email_verified_at',
        'tier_id',
        'accumulated_spent',
        'pending_spent',
        'accumulated_orders',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'accumulated_spent' => 'decimal:2',
            'pending_spent' => 'decimal:2',
            'accumulated_orders' => 'integer',
        ];
    }

    public function addresses()
    {
        return $this->hasMany(UserAddress::class, 'user_id', 'id');
    }

    public function defaultAddress()
    {
        return $this->hasOne(UserAddress::class, 'user_id', 'id')->where('is_default', 1);
    }

    public function tier()
    {
        return $this->belongsTo(MembershipTier::class, 'tier_id');
    }

    public function serviceUsages()
    {
        return $this->hasMany(TierServiceUsage::class, 'user_id');
    }

    public function tierHistories()
    {
        return $this->hasMany(TierHistory::class, 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}