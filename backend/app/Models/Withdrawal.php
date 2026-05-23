<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    use HasFactory;

    protected $table = 'withdrawals';

    protected $fillable = [
        'user_id',
        'amount',
        'bank_info',
        'status',
        'transaction_reference'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}