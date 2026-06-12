<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Mail\AdminResetPasswordMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AdminForgotPasswordController extends Controller
{
    
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:admins,email',
        ], [
            'email.exists' => 'Không tìm thấy tài khoản quản trị với email này.'
        ]);

        $admin = Admin::where('email', $request->email)->first();

        $token = Str::random(64);

        // 2. Lưu vào bảng password_reset_tokens (bảng mặc định của Laravel)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $admin->email],
            [
                'email' => $admin->email,
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        // 3. Gửi Email
        try {
            Mail::to($admin->email)->send(new AdminResetPasswordMail($admin, $token));
            
            return response()->json([
                'success' => true,
                'message' => 'Đã gửi liên kết đặt lại mật khẩu vào email của bạn.'
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi gửi mail SMTP: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Lỗi gửi mail: Cấu hình SMTP chưa chính xác.',
                'debug_error' => $e->getMessage() 
            ], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'token'    => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // 1. Tìm bản ghi token trong DB
        $resetRecord = DB::table('password_reset_tokens')->where('email', $request->email)->first();

        if (!$resetRecord) {
            return response()->json(['message' => 'Yêu cầu không hợp lệ hoặc đã hết hạn.'], 400);
        }

        // 2. Kiểm tra Token có khớp không
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json(['message' => 'Token không hợp lệ.'], 400);
        }

        // 3. Kiểm tra thời hạn Token (Ví dụ: 60 phút)
        $tokenAge = Carbon::parse($resetRecord->created_at)->diffInMinutes(Carbon::now());
        if ($tokenAge > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['message' => 'Liên kết đặt lại mật khẩu đã hết hạn (quá 60 phút).'], 400);
        }

        // 4. Cập nhật mật khẩu cho Admin
        $admin = Admin::where('email', $request->email)->first();
        $admin->password = Hash::make($request->password);
        $admin->save();

        // 5. Xóa token đã sử dụng và thu hồi các phiên đăng nhập cũ
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();
        $admin->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mật khẩu đã được đặt lại thành công.'
        ]);
    }
}