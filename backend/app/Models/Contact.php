<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contact extends Model
{
    use HasFactory;

    protected $table = 'contacts';

    protected $fillable = [
        'fullname',
        'phone',
        'email',
        'message',
        'status',
        'reply_subject',
        'reply_message',
        'replied_at',
        'replied_by',
        'reply_delivery_status',
        'reply_delivery_token',
    ];

    protected function casts(): array
    {
        return [
            'replied_at' => 'datetime',
        ];
    }

    public function customerAccount()
    {
        return $this->belongsTo(User::class, 'email', 'email');
    }

    public function repliedBy()
    {
        return $this->belongsTo(Admin::class, 'replied_by');
    }
}
