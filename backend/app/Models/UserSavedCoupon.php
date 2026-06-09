<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSavedCoupon extends Model
{
    protected $table = 'user_saved_coupons';

    protected $fillable = [
        'user_id',
        'coupon_id',
        'saved_at',
    ];

    protected $casts = [
        'saved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class, 'coupon_id');
    }
}
