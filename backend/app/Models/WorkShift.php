<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes; // Import SoftDeletes

class WorkShift extends Model
{
    use HasFactory, SoftDeletes; // Kích hoạt Xóa mềm

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'late_tolerance',
        'is_overnight',
        'working_days', // Thêm trường working_days
        'overtime_days', // Thêm trường overtime_days
    ];

    protected $casts = [
        'is_overnight' => 'boolean',
        'working_days' => 'array', // Ép kiểu JSON sang Array tự động
        'overtime_days' => 'array', // Ép kiểu JSON sang Array tự động
    ];

    public function assignments()
    {
        return $this->hasMany(AdminShiftAssignment::class, 'work_shift_id');
    }
}