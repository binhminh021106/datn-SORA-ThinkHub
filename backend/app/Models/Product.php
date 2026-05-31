<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'products';

    protected $fillable = [
        'shop_id',
        'category_id',
        'brand_id',
        'name',
        'slug',
        'base_price',
        'promotional_price',
        'description',
        'thumbnail_image',
        'review_count',
        'rating_avg',
        'specifications',
        'is_featured',
        'status',
        'affiliate_commission_rate'
    ];

    protected function casts(): array
    {
        return [
            'specifications' => 'array',
            'base_price' => 'decimal:2',
            'promotional_price' => 'decimal:2',
            'affiliate_commission_rate' => 'decimal:2'
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function brand()
    {
        return $this->belongsTo(Brand::class, 'brand_id');
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class, 'product_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }

    public function scopeAvailableForConfig($query)
    {
        return $query->where('status', 'published')
            ->whereHas('category', function ($q) {
                $q->where('status', 'active');
            })
            ->where(function ($q) {
                $q->whereNull('brand_id')
                    ->orWhereHas('brand', function ($subQ) {
                        $subQ->where('status', 'active');
                    });
            });
    }
}
