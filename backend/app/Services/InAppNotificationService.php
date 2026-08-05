<?php

namespace App\Services;

use App\Models\UserNotification;

// chức năng: dịch vụ thông báo trong ứng dụng (in-app notification), cho phép tạo thông báo cho người dùng với các loại, tiêu đề, nội dung, màn hình hành động và tham số hành động tùy chỉnh.
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
