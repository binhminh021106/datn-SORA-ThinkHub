<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user instanceof \App\Models\User && (int) $user->id === (int) $id;
}, ['guards' => ['sanctum']]);

// Kênh cho Real-time chat: Người sở hữu hoặc Admin được phép tham gia
Broadcast::channel('chat.{id}', function ($user, $id) {
    if ($user instanceof \App\Models\User && (int) $user->id === (int) $id) {
        return true;
    }

    return $user instanceof \App\Models\Admin;
}, ['guards' => ['sanctum']]);

Broadcast::channel('admin', function ($user) {
    return $user instanceof \App\Models\Admin;
}, ['guards' => ['sanctum']]);
