<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model
{
    use HasFactory;

    protected $table = 'holidays';

    protected $fillable = [
        'date',
        'name',
        'is_day_off',
        'multiplier_rate'
    ];

    protected $casts = [
        'date' => 'date',
        'is_day_off' => 'boolean',
        'multiplier_rate' => 'decimal:2',
    ];
}