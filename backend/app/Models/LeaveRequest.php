<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    use HasFactory;

    protected $table = 'leave_requests';

    protected $fillable = [
        'admin_id',
        'start_datetime',
        'end_datetime',
        'reason',
        'status', // pending, approved, rejected
        'approved_by'
    ];

    protected $casts = [
        'start_datetime' => 'datetime',
        'end_datetime' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function approver()
    {
        return $this->belongsTo(Admin::class, 'approved_by');
    }
}