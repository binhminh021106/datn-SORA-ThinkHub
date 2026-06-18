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

        $token = UserPushToken::updateOrCreate(
            ['expo_push_token' => $data['expo_push_token']],
            [
                'user_id' => $request->user()->id,
                'platform' => $data['platform'] ?? null,
                'device_name' => $data['device_name'] ?? null,
                'is_active' => true,
                'last_used_at' => now(),
            ]
        );

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
