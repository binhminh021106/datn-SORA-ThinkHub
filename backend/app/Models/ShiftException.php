<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShiftException extends Model
{
    use HasFactory;

    protected $fillable = [
        'admin_id',
        'date',
        'type',
        'work_shift_id',
        'note', 
    ];

    protected $casts = [
        'date' => 'date', 
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