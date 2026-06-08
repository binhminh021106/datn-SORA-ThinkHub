<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return $user instanceof \App\Models\User && (int) $user->id === (int) $id;
}, ['guards' => ['sanctum']]);

// Kênh cho Real-time chat user-specific: chỉ owner hoặc Admin mới vào được
Broadcast::channel('chat.{id}', function ($user, $id) {
    // Người dùng thường: chỉ vào kênh của chính mình
    if ($user instanceof \App\Models\User && (int) $user->id === (int) $id) {
        return true;
    }
    // Admin: được vào bất kỳ kênh chat nào
    if ($user instanceof \App\Models\Admin) {
        return true;
    }
    return false;
}, ['guards' => ['sanctum']]);

// Kênh riêng của Admin (admin nghe mọi tin nhắn mới từ users)
Broadcast::channel('admin.chat', function ($user) {
    return $user instanceof \App\Models\Admin;
}, ['guards' => ['sanctum']]);

Broadcast::channel('admin', function ($user) {
    return $user instanceof \App\Models\Admin;
}, ['guards' => ['sanctum']]);
