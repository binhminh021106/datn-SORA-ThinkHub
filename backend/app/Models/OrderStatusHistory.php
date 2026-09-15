<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderStatusHistory extends Model
{
    protected $table = 'order_status_histories';

    const UPDATED_AT = null;

    protected $fillable = [
        'order_id',
        'old_status',
        'new_status',
        'note',
        'changed_by',
        'changed_by_type'
    ];

    protected $appends = ['changer'];

    public function order()
    {
        return $this->belongsTo(Order::class, 'order_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'changed_by')->with('role:id,label,value');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    public function getChangerAttribute()
    {
        if ($this->changed_by_type === 'admin' && $this->admin) {
            return [
                'id' => $this->admin->id,
                'name' => $this->admin->fullname,
                'avatar' => $this->admin->avatar_url,
                'role' => $this->admin->role ? $this->admin->role->label : 'Quản trị viên'
            ];
        } elseif ($this->changed_by_type === 'user' && $this->user) {
            return [
                'id' => $this->user->id,
                'name' => $this->user->fullName,
                'avatar' => $this->user->avatar_url,
                'role' => null
            ];
        }
        return null;
    }
}