<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AdminShiftAssignment extends Model
{
    use HasFactory;

    protected $table = 'admin_shift_assignments';

    protected $fillable = [
        'admin_id',
        'work_shift_id',
    ];

    /**
     * Liên kết tới bảng admins
     */
    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    /**
     * Liên kết tới bảng work_shifts
     */
    public function workShift()
    {
        return $this->belongsTo(WorkShift::class, 'work_shift_id');
    }
}