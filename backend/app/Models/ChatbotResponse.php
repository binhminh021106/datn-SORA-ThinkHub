<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotResponse extends Model
{
    use HasFactory;

    protected $table = 'chatbot_responses';

    protected $fillable = [
        'keyword',
        'reply',
        'options'
    ];
}