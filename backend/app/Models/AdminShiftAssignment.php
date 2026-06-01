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
        'valid_from', // Ngày bắt đầu áp dụng ca (MỚI BỔ SUNG)
        'valid_to',   // Ngày kết thúc áp dụng ca (MỚI BỔ SUNG)
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to'   => 'date',
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

    /**
     * Scope: Lấy ra phân ca đang có hiệu lực tại một ngày cụ thể (Mặc định là hôm nay)
     * Cách dùng: AdminShiftAssignment::where('admin_id', $id)->active()->first();
     */
    public function scopeActive($query, $date = null)
    {
        $date = $date ?? now()->toDateString();

        return $query->where(function ($q) use ($date) {
                $q->whereNull('valid_from')
                    ->orWhere('valid_from', '<=', $date);
            })
            ->where(function ($q) use ($date) {
                $q->whereNull('valid_to')
                    ->orWhere('valid_to', '>=', $date);
            });
    }
}
