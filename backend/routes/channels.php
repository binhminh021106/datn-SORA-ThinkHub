<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Kênh cho Real-time chat: Người sở hữu hoặc Admin được phép tham gia
Broadcast::channel('chat.{id}', function ($user, $id) {
    // Nếu là chính chủ kênh
    if ((int) $user->id === (int) $id) {
        return true;
    }

    // Nếu là Admin (Kiểm tra xem user có tồn tại trong bảng admins không)
    // Hoặc kiểm tra qua guard/class nếu bạn phân tách model Admin
    return \App\Models\Admin::where('id', $user->id)->exists() || (int) $user->id === 1;
});

Broadcast::channel('admin', function ($user) {
    return \App\Models\Admin::where('id', $user->id)->exists() || (int) $user->id === 1;
});
