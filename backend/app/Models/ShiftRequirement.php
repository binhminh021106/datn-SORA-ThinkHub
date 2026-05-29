<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftRequirement extends Model
{
    use HasFactory;

    protected $table = 'shift_requirements';

    protected $fillable = [
        'work_shift_id',
        'role_id',
        'day_of_week', // 0=CN, 1=T2... 6=T7
        'required_count'
    ];

    protected $casts = [
        'day_of_week' => 'integer',
        'required_count' => 'integer',
    ];

    public function workShift()
    {
        return $this->belongsTo(WorkShift::class, 'work_shift_id');
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id');
    }
}