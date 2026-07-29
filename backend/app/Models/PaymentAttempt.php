<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'gateway',
        'merchant_reference',
        'gateway_request_id',
        'amount',
        'status',
        'cart_snapshot',
        'checkout_source',
        'mobile_return_url',
        'expires_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'cart_snapshot' => 'array',
            'expires_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
