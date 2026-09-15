<?php

namespace App\Services;

use App\Models\UserNotification;

class InAppNotificationService
{
    public function createForUser(
        ?int $userId,
        string $type,
        string $title,
        ?string $body = null,
        ?string $actionScreen = null,
        array $actionParams = []
    ): ?UserNotification {
        if (!$userId) {
            return null;
        }

        return UserNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'action_screen' => $actionScreen,
            'action_params' => $actionParams ?: null,
        ]);
    }
}
