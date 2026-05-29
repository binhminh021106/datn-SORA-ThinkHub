<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OvertimeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'date',
        'start_time',
        'end_time',
        'reason',          // Bổ sung
        'multiplier_rate', // Bổ sung
        'status',
        'approved_by',     // Bổ sung
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i', // Chuẩn hoá đầu ra
        'end_time' => 'datetime:H:i',   // Chuẩn hoá đầu ra
        'multiplier_rate' => 'decimal:2',
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