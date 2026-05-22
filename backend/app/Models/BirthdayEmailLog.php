<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BirthdayEmailLog extends Model
{
    protected $fillable = [
        'user_id',
        'coupon_id',
        'email',
        'sent_at',
        'status',
        'error_message'
    ];

    protected $casts = [
        'sent_at' => 'datetime',
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
