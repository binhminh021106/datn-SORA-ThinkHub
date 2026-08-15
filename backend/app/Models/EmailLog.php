<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'event_type',
        'campaign_year',
        'sent_at',
        'queued_at',
        'status',
        'voucher_code',
        'action_url',
        'error_message',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'queued_at' => 'datetime',
    ];

    // Quan hệ với bảng User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
