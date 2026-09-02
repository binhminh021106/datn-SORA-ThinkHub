<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Str;

class ColorDictionary extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'normalized_name', 'color_code'];

    protected static function booted()
    {
        static::saving(function ($color) {
            // Using a simple normalization: lowercase and remove accents
            // We use Str::slug with a space separator and then remove hyphens
            $slug = Str::slug($color->name, ' ');
            $color->normalized_name = str_replace('-', ' ', $slug);
        });
    }
}
