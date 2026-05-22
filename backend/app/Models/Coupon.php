<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes;
    
    protected $table = 'coupons';

    protected $fillable = [
        'name',
        'code',
        'min_spend', // chi tieu toi thieu
        'type',
        'value',
        'usage_limit',
        'usage_count',
        'usage_limit_per_user',
        'expires_at',
        'status'
    ];
}