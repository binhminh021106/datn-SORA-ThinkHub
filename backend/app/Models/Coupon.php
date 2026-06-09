<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes;
    
    protected $table = 'coupons';

    protected $fillable = [
        'user_id',
        'name',
        'code',
        'min_spend', // chi tieu toi thieu
        'type',
        'value',
        'usage_limit',
        'usage_count',
        'usage_limit_per_user',
        'expires_at',
        'is_used',
        'status'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_used' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function birthdayEmailLog()
    {
        return $this->hasOne(BirthdayEmailLog::class, 'coupon_id');
    }

    public function savedByUsers()
    {
        return $this->hasMany(UserSavedCoupon::class, 'coupon_id');
    }
}
