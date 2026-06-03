<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaceVerificationLog extends Model
{
    use HasFactory;

    protected $table = 'face_verification_logs';

    protected $fillable = [
        'admin_id',
        'attendance_id',
        'action',
        'is_matched',
        'face_distance',
        'threshold',
        'ip_address',
        'user_agent',
        'note',
    ];

    protected $casts = [
        'is_matched' => 'boolean',
        'face_distance' => 'float',
        'threshold' => 'float',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function attendance()
    {
        return $this->belongsTo(AdminAttendance::class, 'attendance_id');
    }
}
