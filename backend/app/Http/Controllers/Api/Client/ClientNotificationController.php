<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use Illuminate\Http\Request;

class ClientNotificationController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $perPage = max(1, min((int) $request->input('per_page', 10), 30));
        $typeGroup = $request->input('type_group');
        $typeMap = [
            'order' => ['order_success', 'order_status'],
            'affiliate' => ['affiliate'],
            'coupon' => ['coupon'],
        ];

        $query = UserNotification::where('user_id', $userId);

        if ($typeGroup && isset($typeMap[$typeGroup])) {
            $query->whereIn('type', $typeMap[$typeGroup]);
        }

        $filteredUnreadCount = (clone $query)
            ->whereNull('read_at')
            ->count();

        $notifications = (clone $query)
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => UserNotification::where('user_id', $userId)
                ->whereNull('read_at')
                ->count(),
            'filtered_unread_count' => $filteredUnreadCount,
        ]);
    }

    public function markAsRead(Request $request, int $id)
    {
        $notification = UserNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->firstOrFail();

        if (!$notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu thông báo là đã đọc.',
            'data' => $notification->fresh(),
        ]);
    }

    public function markAllAsRead(Request $request)
    {
        UserNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu tất cả thông báo là đã đọc.',
        ]);
    }

    public function destroy(Request $request, int $id)
    {
        UserNotification::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xoá thông báo.',
        ]);
    }

    public function destroyRead(Request $request)
    {
        $deleted = UserNotification::where('user_id', $request->user()->id)
            ->whereNotNull('read_at')
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xoá tất cả thông báo đã đọc.',
            'deleted_count' => $deleted,
        ]);
    }
}
