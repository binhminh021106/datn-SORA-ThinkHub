<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Setting;
use App\Models\User;

class AdminOrderConfigController extends Controller
{
    /**
     * Lấy cấu hình Cooldown và danh sách User kèm số đơn hàng
     */
    public function index(Request $request)
    {
        $cooldownSetting = Setting::firstOrCreate(
            ['key' => 'order_cooldown_minutes'],
            ['value' => '0', 'type' => 'integer']
        );

        $perPage = $request->input('per_page', 10);
        $perPage = min((int) $perPage, 100);
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'recent_orders_count');
        $sortDir = in_array(strtolower($request->input('sort_dir')), ['asc', 'desc'], true) ? strtolower($request->input('sort_dir')) : 'desc';

        $query = User::withCount([
            'orders',
            'orders as recent_orders_count' => function ($query) {
                $query->where('created_at', '>=', now()->subHours(24));
            }
        ]);

        if (!empty($search)) {
            $query->where(function($q) use ($search) {
                $q->where('fullName', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if (in_array($sortBy, ['orders_count', 'recent_orders_count', 'created_at'])) {
            $query->orderBy($sortBy, $sortDir);
        } else {
            $query->orderByDesc('orders_count');
        }

        $users = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'cooldown_minutes' => (int)$cooldownSetting->value,
            'users' => $users
        ]);
    }

    /**
     * Cập nhật số phút Cooldown
     */
    public function updateConfig(Request $request)
    {
        $request->validate([
            'cooldown_minutes' => 'required|integer|min:0'
        ]);

        $setting = Setting::firstOrCreate(
            ['key' => 'order_cooldown_minutes'],
            ['type' => 'integer']
        );
        $setting->value = (string)$request->cooldown_minutes;
        $setting->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật cấu hình độ trễ đặt hàng thành công!',
            'cooldown_minutes' => (int)$setting->value
        ]);
    }

    /**
     * Thêm/Xóa User khỏi Blacklist chặn đặt hàng
     */
    public function toggleBlockOrder($id)
    {
        $user = User::findOrFail($id);
        $user->is_order_blocked = !$user->is_order_blocked;
        $user->save();

        $action = $user->is_order_blocked ? 'Chặn' : 'Bỏ chặn';

        return response()->json([
            'success' => true,
            'message' => "Đã $action đặt hàng đối với tài khoản $user->email.",
            'is_order_blocked' => $user->is_order_blocked
        ]);
    }

    /**
     * Khóa/Mở khóa hoàn toàn tài khoản
     */
    public function toggleLockAccount($id)
    {
        $user = User::findOrFail($id);
        
        if ($user->status === 'locked') {
            $user->status = 'active';
            $message = "Đã mở khóa tài khoản $user->email.";
        } else {
            $user->status = 'locked';
            $message = "Đã khóa hoàn toàn tài khoản $user->email.";
        }
        
        $user->save();

        return response()->json([
            'success' => true,
            'message' => $message,
            'status' => $user->status
        ]);
    }
}
