<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    // Trỏ tới bảng reviews tổng quát (chứa cả Product và Combo)
    protected $table = 'reviews';

    protected $fillable = [
        'product_id',
        'combo_id', // Bổ sung combo_id
        'user_id',
        'order_id',
        'rating',
        'comment',
        'images',
        'status',
        'admin_reply'
    ];

    // Ép kiểu mảng JSON cho cột images tự động
    protected function casts(): array
    {
        return [
            'images' => 'array',
            'rating' => 'float',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function combo()
    {
        return $this->belongsTo(Combo::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}