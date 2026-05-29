<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftSwap extends Model
{
    use HasFactory;

    protected $table = 'shift_swaps';

    protected $fillable = [
        'request_admin_id',
        'target_admin_id',
        'date',
        'work_shift_id',
        'status', // pending, approved, rejected
        'approved_by'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Người xin đổi ca
     */
    public function requester()
    {
        return $this->belongsTo(Admin::class, 'request_admin_id');
    }

    /**
     * Người được nhờ thế ca
     */
    public function target()
    {
        return $this->belongsTo(Admin::class, 'target_admin_id');
    }

    /**
     * Ca làm việc bị đổi
     */
    public function workShift()
    {
        return $this->belongsTo(WorkShift::class, 'work_shift_id');
    }

    /**
     * Người duyệt đổi ca
     */
    public function approver()
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }
}