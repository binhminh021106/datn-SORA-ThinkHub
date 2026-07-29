<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\UserPushToken;
use Illuminate\Http\Request;

class ClientPushTokenController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255'],
            'platform' => ['nullable', 'string', 'max:20'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        $userId = $request->user()->id;
        $token = UserPushToken::where('expo_push_token', $data['expo_push_token'])->first();

        // A device token must not be reassigned by another authenticated
        // account simply because that account submits the same value.
        if ($token && (int) $token->user_id !== (int) $userId) {
            return response()->json([
                'success' => false,
                'message' => 'Thiết bị này đang được liên kết với một tài khoản khác.',
            ], 409);
        }

        if (! $token) {
            $activeTokenCount = UserPushToken::where('user_id', $userId)
                ->where('is_active', true)
                ->count();

            if ($activeTokenCount >= 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tài khoản chỉ có thể liên kết tối đa 10 thiết bị nhận thông báo.',
                ], 422);
            }

            $token = new UserPushToken(['expo_push_token' => $data['expo_push_token']]);
            $token->user_id = $userId;
        }

        $token->platform = $data['platform'] ?? null;
        $token->device_name = $data['device_name'] ?? null;
        $token->is_active = true;
        $token->last_used_at = now();
        $token->save();

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu thiết bị nhận thông báo.',
            'data' => $token,
        ]);
    }

    public function destroy(Request $request)
    {
        $data = $request->validate([
            'expo_push_token' => ['required', 'string', 'max:255'],
        ]);

        UserPushToken::where('user_id', $request->user()->id)
            ->where('expo_push_token', $data['expo_push_token'])
            ->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tắt thông báo trên thiết bị này.',
        ]);
    }
}
