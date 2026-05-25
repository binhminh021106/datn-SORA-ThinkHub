<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAttendance extends Model
{
    use HasFactory;

    protected $table = 'admin_attendances';

    protected $fillable = [
        'admin_id',
        'work_shift_id',
        'shift_start_time',     // Lưu cứng giờ bắt đầu ca
        'shift_end_time',       // Lưu cứng giờ kết thúc ca
        'shift_late_tolerance', // Lưu cứng số phút cho phép đi muộn
        'attendance_date',
        'clock_in',
        'clock_out',
        'status',
        'checkout_status',
        'ip_address',
        'user_agent',
        'late_minutes',
        'early_leave_minutes',
        'note',
    ];

    // Ép kiểu dữ liệu khi lấy ra hoặc lưu vào DB
    protected $casts = [
        'attendance_date'      => 'date',
        'clock_in'             => 'datetime',
        'clock_out'            => 'datetime',
        'late_minutes'         => 'integer',
        'early_leave_minutes'  => 'integer',
        'shift_late_tolerance' => 'integer',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function workShift()
    {
        return $this->belongsTo(WorkShift::class, 'work_shift_id');
    }
}
