<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $table = 'cart_items';

    protected $fillable = [
        'cart_id',
        'product_variant_id',
        'combo_id',
        'combo_selections',
        'quantity'
    ];

    protected $appends = ['price', 'subtotal'];

    protected function casts(): array
    {
        return [
            'combo_selections' => 'array',
            'quantity' => 'integer'
        ];
    }

    public function cart()
    {
        return $this->belongsTo(Cart::class, 'cart_id');
    }

    public function variant()
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    public function combo()
    {
        return $this->belongsTo(Combo::class, 'combo_id');
    }

    public function getPriceAttribute()
    {
        if ($this->combo_id && $this->combo) {
            $total = 0;
            // 1. Tính giá các món khách hàng tự chọn (combo_selections)
            if (is_array($this->combo_selections) && count($this->combo_selections) > 0) {
                foreach ($this->combo_selections as $selection) {
                    if (isset($selection['price'])) {
                        $total += $selection['price'];
                    } else {
                        // Dự phòng cho dữ liệu cũ chưa được lưu price
                        $v = \App\Models\ProductVariant::find($selection['selected_variant_id']);
                        if ($v) {
                            $total += $v->promotional_price ?: $v->price;
                        }
                    }
                }
            }

            // 2. Tính giá các món cố định trong Combo (do Admin thiết lập)
            if ($this->combo->items) {
                foreach ($this->combo->items as $cItem) {
                    if ($cItem->product_variant_id && $cItem->variant) {
                        $vPrice = $cItem->variant->promotional_price ?: $cItem->variant->price;
                        $total += $vPrice * $cItem->quantity;
                    }
                }
            }

            // 3. Trừ đi chiết khấu của Combo
            $discount = $this->combo->discount_value;
            if ($this->combo->discount_type === 'percentage') {
                $total = $total - ($total * ($discount / 100));
            } else {
                $total = max(0, $total - $discount);
            }
            return $total;
        }

        if ($this->product_variant_id && $this->variant) {
            return $this->variant->promotional_price ?: $this->variant->price;
        }

        return 0;
    }

    public function getSubtotalAttribute()
    {
        return $this->price * $this->quantity;
    }
}
