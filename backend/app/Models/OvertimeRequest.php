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
        'reason',          
        'multiplier_rate', 
        'status',
        'approved_by',    
    ];

    protected $casts = [
        'date' => 'date',
        'start_time' => 'datetime:H:i', 
        'end_time' => 'datetime:H:i', 
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