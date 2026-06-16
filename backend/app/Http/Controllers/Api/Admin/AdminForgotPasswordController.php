<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Mail\AdminForgotPasswordOtpMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\DB;

class AdminForgotPasswordController extends Controller
{
    /**
     * BƯỚC 1: GỬI OTP CHO ADMIN
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
        ]);

        $email = $request->email;

        // Chống spam: Tối đa 1 lần / 2 phút cho hệ thống admin
        if (RateLimiter::tooManyAttempts('admin-send-otp-'.$email, 1)) {
            $seconds = RateLimiter::availableIn('admin-send-otp-'.$email);
            return response()->json(['message' => "Hệ thống đang xử lý. Vui lòng thử lại sau {$seconds} giây."], 429);
        }
        RateLimiter::hit('admin-send-otp-'.$email, 120);

        // Chỉ tạo và gửi OTP nếu Admin tồn tại trong hệ thống
        $admin = Admin::where('email', $email)->first();
        if ($admin) {
            $otp = sprintf("%06d", random_int(100000, 999999));

            $expiresAt = now()->addMinutes(5);

            // Tách biệt hoàn toàn key cache với hệ thống user
            Cache::store('file')->put('admin_password_reset_otp_' . $email, [
                'otp' => $otp,
                'attempts' => 0,
                'expires_at' => $expiresAt,
            ], $expiresAt);

            // Gửi email
            try {
                Mail::to($email)->send(new AdminForgotPasswordOtpMail($otp));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lỗi gửi mail SMTP (Admin OTP): ' . $e->getMessage());
                // Không throw error ra ngoài để tránh lộ việc email có tồn tại hay không
            }
        }

        // Luôn trả về thông báo chung để tránh lỗi Enumeration Attack
        return response()->json(['success' => true, 'message' => 'Nếu tài khoản quản trị tồn tại, mã OTP sẽ được gửi đến email của bạn.']);
    }

    /**
     * BƯỚC 2: XÁC THỰC OTP ADMIN
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|digits:6',
        ], [
            'email.required' => 'Vui lòng nhập email.',
            'email.email' => 'Email không hợp lệ.',
            'otp.required' => 'Vui lòng nhập mã OTP.',
            'otp.digits' => 'Mã OTP phải bao gồm 6 chữ số.',
        ]);

        $email = $request->email;
        $otp = $request->otp;

        // Chống Brute-force: Khóa 5 phút nếu sai 5 lần
        if (RateLimiter::tooManyAttempts('admin-verify-otp-'.$email, 5)) {
            return response()->json(['message' => 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.'], 403);
        }

        $cacheKey = 'admin_password_reset_otp_' . $email;
        $cacheData = Cache::store('file')->get($cacheKey);

        // 1. Lỗi: Hết hạn hoặc không tồn tại
        if (!$cacheData) {
            return response()->json(['message' => 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại.'], 400);
        }

        // 2. Lỗi: Vượt quá số lần cho phép trong cùng 1 vòng đời OTP
        if ($cacheData['attempts'] >= 5) {
            Cache::store('file')->forget($cacheKey);
            return response()->json(['message' => 'Bạn đã nhập sai quá nhiều lần. Mã OTP đã bị hủy để bảo mật.'], 403);
        }

        // 3. Lỗi: OTP Sai
        if ($cacheData['otp'] !== $otp) {
            $cacheData['attempts']++;
            Cache::store('file')->put($cacheKey, $cacheData, $cacheData['expires_at'] ?? now());
            RateLimiter::hit('admin-verify-otp-'.$email, 300);
            $attemptsLeft = 5 - $cacheData['attempts'];
            return response()->json(['message' => "Mã OTP không chính xác. Bạn còn {$attemptsLeft} lần thử."], 400);
        }

        // 4. THÀNH CÔNG: Xóa OTP, sinh Token bảo mật để đi tiếp Bước 3
        Cache::store('file')->forget($cacheKey);
        RateLimiter::clear('admin-verify-otp-'.$email);

        $resetToken = Str::random(60);
        // Token sống 15 phút
        Cache::store('file')->put('admin_password_reset_token_' . $email, $resetToken, now()->addMinutes(15));

        return response()->json([
            'success' => true, 
            'message' => 'Xác thực OTP thành công.',
            'reset_token' => $resetToken
        ]);
    }

    /**
     * BƯỚC 3: ĐẶT LẠI MẬT KHẨU ADMIN
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'reset_token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $email = $request->email;
        $resetToken = $request->reset_token;
        $newPassword = $request->password;

        $validToken = Cache::store('file')->get('admin_password_reset_token_' . $email);

        // Kiểm tra Token
        if (!$validToken) {
            return response()->json(['message' => 'Phiên làm việc đã hết hạn. Vui lòng yêu cầu lại OTP.'], 403);
        }

        if ($validToken !== $resetToken) {
            return response()->json(['message' => 'Mã bảo mật không khớp. Phiên làm việc lỗi.'], 403);
        }

        // Truy xuất Admin
        $admin = Admin::where('email', $email)->first();
        if (!$admin) {
            return response()->json(['message' => 'Lỗi dữ liệu: Không tìm thấy tài khoản quản trị.'], 404);
        }

        try {
            DB::transaction(function () use ($admin, $newPassword) {
                // Cập nhật mật khẩu mới
                $admin->password = Hash::make($newPassword);
                $admin->save();

                // Xóa tất cả các token hiện có (đăng xuất thiết bị khác)
                $admin->tokens()->delete();
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi Database khi đổi mật khẩu Admin: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi hệ thống khi lưu mật khẩu mới.'], 500);
        }

        // Hủy Token bảo mật sau khi đổi xong
        Cache::store('file')->forget('admin_password_reset_token_' . $email);

        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.']);
    }
}