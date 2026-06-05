<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminAttendanceAdjustment extends Model
{
    use HasFactory;

    protected $fillable = [
        'attendance_id',
        'admin_id',
        'adjusted_by_admin_id',
        'work_shift_id',
        'attendance_date',
        'old_clock_in',
        'new_clock_in',
        'old_clock_out',
        'new_clock_out',
        'old_status',
        'new_status',
        'old_checkout_status',
        'new_checkout_status',
        'old_late_minutes',
        'new_late_minutes',
        'old_early_leave_minutes',
        'new_early_leave_minutes',
        'old_ot_minutes',
        'new_ot_minutes',
        'old_is_ot_approved',
        'new_is_ot_approved',
        'reason',
        'note',
    ];

    protected $casts = [
        'attendance_date' => 'date',
        'old_clock_in' => 'datetime',
        'new_clock_in' => 'datetime',
        'old_clock_out' => 'datetime',
        'new_clock_out' => 'datetime',
        'old_late_minutes' => 'integer',
        'new_late_minutes' => 'integer',
        'old_early_leave_minutes' => 'integer',
        'new_early_leave_minutes' => 'integer',
        'old_ot_minutes' => 'integer',
        'new_ot_minutes' => 'integer',
        'old_is_ot_approved' => 'boolean',
        'new_is_ot_approved' => 'boolean',
    ];

    public function attendance()
    {
        return $this->belongsTo(AdminAttendance::class, 'attendance_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function adjustedBy()
    {
        return $this->belongsTo(Admin::class, 'adjusted_by_admin_id');
    }

    public function workShift()
    {
        return $this->belongsTo(WorkShift::class, 'work_shift_id');
    }
}
