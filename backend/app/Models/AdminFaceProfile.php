<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminFaceProfile extends Model
{
    use HasFactory;

    protected $table = 'admin_face_profiles';

    protected static function booted(): void
    {
        static::saving(function (AdminFaceProfile $profile) {
            $descriptors = $profile->face_descriptors;

            if (
                !is_array($descriptors)
                || count($descriptors) !== 1
                || !is_array($descriptors[0] ?? null)
                || count($descriptors[0]) !== 128
            ) {
                throw new \InvalidArgumentException('A face profile must contain exactly one 128-value descriptor.');
            }

            $profile->sample_count = 1;
        });
    }

    protected $hidden = [
        'face_descriptors',
    ];

    protected $fillable = [
        'admin_id',
        'face_descriptors',
        'sample_count',
        'model_name',
        'model_version',
        'is_active',
        'registered_at',
        'last_verified_at',
    ];

    protected $casts = [
        'face_descriptors' => 'array',
        'sample_count' => 'integer',
        'is_active' => 'boolean',
        'registered_at' => 'datetime',
        'last_verified_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }
}
