<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HolidayEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'event_date',
        'target_audience',
        'email_subject',
        'email_content',
        'voucher_code',
        'discount',     // BỔ SUNG DÒNG NÀY ĐỂ LARAVEL CHO PHÉP LƯU
        'expires_at',
        'status'
    ];

    protected $casts = [
        'target_audience' => 'array',
    ];
}