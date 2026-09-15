<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ExpoPushNotificationService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    public function sendToUser(User|int|null $user, string $title, string $body, array $data = []): void
    {
        $userId = $user instanceof User ? $user->id : $user;
        if (!$userId) {
            return;
        }

        $tokens = \App\Models\UserPushToken::where('user_id', $userId)
            ->where('is_active', true)
            ->pluck('expo_push_token')
            ->filter(fn ($token) => is_string($token) && (
                str_starts_with($token, 'ExpoPushToken[') ||
                str_starts_with($token, 'ExponentPushToken[')
            ))
            ->values();

        if ($tokens->isEmpty()) {
            return;
        }

        $messages = $tokens->map(fn ($token) => [
            'to' => $token,
            'sound' => 'default',
            'title' => $title,
            'body' => $body,
            'data' => $data,
        ])->all();

        try {
            $response = Http::timeout(8)
                ->acceptJson()
                ->post(self::EXPO_PUSH_URL, $messages);

            if (!$response->successful()) {
                Log::warning('Expo push notification failed', [
                    'user_id' => $userId,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning('Expo push notification exception', [
                'user_id' => $userId,
                'message' => $e->getMessage(),
            ]);
        }
    }
}
