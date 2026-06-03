<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminFaceProfile extends Model
{
    use HasFactory;

    protected $table = 'admin_face_profiles';

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
