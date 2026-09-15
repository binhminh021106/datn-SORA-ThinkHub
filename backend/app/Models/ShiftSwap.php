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
        'status', 
        'approved_by'
    ];

    protected $casts = [
        'date' => 'date',
    ];
    public function requester()
    {
        return $this->belongsTo(Admin::class, 'request_admin_id');
    }

    public function target()
    {
        return $this->belongsTo(Admin::class, 'target_admin_id');
    }

    public function workShift()
    {
        return $this->belongsTo(WorkShift::class, 'work_shift_id');
    }

    public function approver()
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }
}