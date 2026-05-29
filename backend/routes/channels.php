<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
}, ['guards' => ['sanctum']]);

// Kênh cho Real-time chat: Người sở hữu hoặc Admin được phép tham gia
Broadcast::channel('chat.{id}', function ($user, $id) {
    if ((int) $user->id === (int) $id) {
        return true;
    }
    return \App\Models\Admin::where('id', $user->id)->exists() || (int) $user->id === 1;
}, ['guards' => ['sanctum']]);

Broadcast::channel('admin', function ($user) {
    return \App\Models\Admin::where('id', $user->id)->exists() || (int) $user->id === 1;
}, ['guards' => ['sanctum']]);
