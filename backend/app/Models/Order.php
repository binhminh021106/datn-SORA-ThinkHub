<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Order extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'orders';

    protected $hidden = [
        'guest_access_token',
        'idempotency_key',
    ];

    protected $fillable = [
        'order_code',
        'guest_access_token',
        'idempotency_key',
        'user_id',
        'customer_name',
        'customer_phone',
        'customer_address',
        'customer_email',
        'order_note',
        'sub_total',
        'discount_amount',
        'tier_discount_amount',
        'shipping_fee',
        'total_amount',
        'coupon_id',
        'affiliate_user_id',
        'coupon_code',
        'payment_method',
        'payment_status',
        'status',
        'refund_bank_name',
        'refund_account_number',
        'refund_account_name',
        'refund_amount',
        'refund_note',
        'return_images',
    ];

    protected function casts(): array
    {
        return [
            'sub_total' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_fee' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'tier_discount_amount' => 'decimal:2',
            'return_images' => 'array',
        ];
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }

    public function histories()
    {
        return $this->hasMany(OrderStatusHistory::class, 'order_id')->orderBy('created_at', 'desc');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function paymentAttempts()
    {
        return $this->hasMany(PaymentAttempt::class);
    }
    
}
