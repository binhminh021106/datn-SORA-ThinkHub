<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Admin\AdminAccountController;
use App\Http\Controllers\Api\Admin\AdminForgotPasswordController;

// --- ADMIN AUTH ROUTES ---
Route::prefix('admin')->group(function () {
    // Đăng ký & Đăng nhập
    Route::post('/register', [AdminAccountController::class, 'store']);
    Route::post('/login', [AdminAccountController::class, 'login']);

    // Quên mật khẩu & Đặt lại mật khẩu
    Route::post('/forgot-password', [AdminForgotPasswordController::class, 'sendResetLinkEmail']);
    Route::post('/reset-password', [AdminForgotPasswordController::class, 'resetPassword']);
});
