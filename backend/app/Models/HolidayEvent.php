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
        'status'
    ];
}