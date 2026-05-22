<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes; 
use App\Models\Role;

class Admin extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'fullname',
        'email',
        'password',
        'role_id',
        'phone',
        'avatar_url',
        'status',
        'address'
    ];

    protected $hidden = ['password'];

    protected function casts(): array
    {
        return ['password' => 'hashed'];
    }

    public function role()
    {
        return $this->belongsTo(Role::class, 'role_id', 'id');
    }

    /**
     * Lấy bản ghi chấm công cho 1 ngày (dùng eager load với constraint từ controller)
     */
    public function attendance()
    {
        return $this->hasOne(AdminAttendance::class, 'admin_id', 'id');
    }

    /**
     * Lấy ca phân công cho nhân viên
     */
    public function shiftAssignment()
    {
        return $this->hasOne(AdminShiftAssignment::class, 'admin_id', 'id');
    }
}
