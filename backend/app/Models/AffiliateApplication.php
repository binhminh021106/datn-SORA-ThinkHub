<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliateApplication extends Model
{
    use HasFactory;

    protected $table = 'affiliate_applications';

    protected $fillable = [
        'user_id',
        'social_links',
        'introduce_message',
        'status',
        'admin_notes'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}