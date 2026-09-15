<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; 
class News extends Model
{
    use HasFactory, SoftDeletes; 

    protected $table = 'news';

    protected $fillable = [
        'title',
        'slug',
        'excerpt',
        'content',
        'image_url',
        'author_name',
        'category',
        'status',
        'views',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];
}