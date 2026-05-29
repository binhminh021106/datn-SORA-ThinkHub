<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WorkShift extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'start_time',
        'end_time',
        'late_tolerance',
        'is_overnight',
        'working_days',
        'overtime_days',
        'is_active', 
    ];

    protected $casts = [
        'is_overnight' => 'boolean',
        'working_days' => 'array',
        'overtime_days' => 'array',
        'is_active' => 'boolean',
    ];

    public function assignments()
    {
        return $this->hasMany(AdminShiftAssignment::class, 'work_shift_id');
    }
}