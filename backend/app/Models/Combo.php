<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Combo extends Model
{
    use SoftDeletes;

    protected $table = 'combos';

    protected $fillable = [
        'name',
        'slug',
        'description',
        'thumbnail_image',
        'target_gender',
        'target_age_group',
        'theme',
        'discount_type',
        'discount_value',
        'is_discount_stackable',
        'usage_limit',
        'start_date',
        'end_date',
        'status'
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'is_discount_stackable' => 'boolean',
            'usage_limit' => 'integer',
            'start_date' => 'datetime:Y-m-d H:i:s',
            'end_date' => 'datetime:Y-m-d H:i:s',
        ];
    }

    public function items()
    {
        return $this->hasMany(ComboItem::class, 'combo_id');
    }

    public function reviews()
    {
        return $this->hasMany(Review::class);
    }
}
