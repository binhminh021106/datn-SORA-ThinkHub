<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $table = 'order_items';

    // Vì bảng này lưu snapshot, không cần updated_at, created_at
    public $timestamps = false;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_variant_id',
        'product_name',
        'variant_sku',
        'variant_attributes',
        'variant_image',
        'price',
        'quantity',
        'total_price',
        'combo_id',
        'combo_selections'
    ];

    protected function casts(): array
    {
        return [
            'variant_attributes' => 'array',
            'combo_selections'   => 'array',
            'price'              => 'decimal:2',
            'total_price'        => 'decimal:2',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function combo()
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }
}
