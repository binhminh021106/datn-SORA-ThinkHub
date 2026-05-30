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
        'sent_at',
        'status',
        'voucher_code',
        'action_url',
    ];

    // Quan hệ với bảng User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
