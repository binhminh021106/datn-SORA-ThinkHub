<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\UserForgotPasswordOtpMail;
use Illuminate\Support\Facades\RateLimiter;
use App\Http\Requests\Client\Auth\SendOtpRequest;
use App\Http\Requests\Client\Auth\VerifyOtpRequest;
use App\Http\Requests\Client\Auth\ResetPasswordRequest;
use Illuminate\Support\Facades\DB;

class UserForgotPasswordController extends Controller
{
    /**
     * BƯỚC 1: GỬI OTP
     */
    public function sendOtp(SendOtpRequest $request)
    {
        $email = $request->validated('email');

        // Chống spam: Tối đa 1 lần / 2 phút
        if (RateLimiter::tooManyAttempts('send-otp-'.$email, 1)) {
            $seconds = RateLimiter::availableIn('send-otp-'.$email);
            return response()->json(['message' => "Hệ thống đang xử lý. Vui lòng thử lại sau {$seconds} giây."], 429);
        }
        RateLimiter::hit('send-otp-'.$email, 120);

        // Chỉ tạo và gửi OTP nếu User tồn tại trong hệ thống
        $user = User::where('email', $email)->first();
        if ($user) {
            $otp = sprintf("%06d", random_int(100000, 999999));

            $expiresAt = now()->addMinutes(5);

            // DÙNG CACHE FILE: Không sợ lỗi Timezone của MySQL
            Cache::store('file')->put('user_password_reset_otp_' . $email, [
                'otp' => $otp,
                'attempts' => 0,
                'expires_at' => $expiresAt,
            ], $expiresAt);

            // Gửi email
            try {
                Mail::to($email)->send(new UserForgotPasswordOtpMail($otp));
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Lỗi gửi mail SMTP (OTP): ' . $e->getMessage());
                // Không throw error ra ngoài để tránh lộ việc email có tồn tại hay không
            }
        }

        // Luôn trả về câu thông báo chung
        return response()->json(['success' => true, 'message' => 'Nếu email của bạn tồn tại trong hệ thống, mã OTP sẽ được gửi đến hộp thư.']);
    }

    /**
     * BƯỚC 2: XÁC THỰC OTP
     */
    public function verifyOtp(VerifyOtpRequest $request)
    {
        $email = $request->validated('email');
        $otp = $request->validated('otp');

        // Chống Brute-force: Khóa 5 phút nếu sai 5 lần
        if (RateLimiter::tooManyAttempts('verify-otp-'.$email, 5)) {
            return response()->json(['message' => 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.'], 403);
        }

        $cacheKey = 'user_password_reset_otp_' . $email;
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
            RateLimiter::hit('verify-otp-'.$email, 300);
            $attemptsLeft = 5 - $cacheData['attempts'];
            return response()->json(['message' => "Mã OTP không chính xác. Bạn còn {$attemptsLeft} lần thử."], 400);
        }

        // 4. THÀNH CÔNG: Xóa OTP, sinh Token bảo mật để đi tiếp Bước 3
        Cache::store('file')->forget($cacheKey);
        RateLimiter::clear('verify-otp-'.$email);

        $resetToken = Str::random(60);
        // Token sống 15 phút
        Cache::store('file')->put('user_password_reset_token_' . $email, $resetToken, now()->addMinutes(15));

        return response()->json([
            'success' => true, 
            'message' => 'Xác thực OTP thành công.',
            'reset_token' => $resetToken
        ]);
    }

    /**
     * BƯỚC 3: ĐẶT LẠI MẬT KHẨU
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $email = $request->validated('email');
        $resetToken = $request->validated('reset_token');
        $newPassword = $request->validated('password');

        $validToken = Cache::store('file')->get('user_password_reset_token_' . $email);

        // Kiểm tra Token
        if (!$validToken) {
            return response()->json(['message' => 'Phiên làm việc đã hết hạn. Vui lòng yêu cầu lại OTP.'], 403);
        }

        if ($validToken !== $resetToken) {
            return response()->json(['message' => 'Mã bảo mật không khớp. Phiên làm việc lỗi.'], 403);
        }

        // Truy xuất User
        $user = User::where('email', $email)->first();
        if (!$user) {
            return response()->json(['message' => 'Lỗi dữ liệu: Không tìm thấy tài khoản.'], 404);
        }

        try {
            DB::transaction(function () use ($user, $newPassword) {
                // Cập nhật mật khẩu mới
                $user->password = Hash::make($newPassword);
                $user->save();

                // Xóa tất cả các token hiện có (đăng xuất thiết bị khác)
                $user->tokens()->delete();
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Lỗi Database khi đổi mật khẩu User: ' . $e->getMessage());
            return response()->json(['message' => 'Lỗi hệ thống khi lưu mật khẩu mới.'], 500);
        }

        // Hủy Token bảo mật sau khi đổi xong
        Cache::store('file')->forget('user_password_reset_token_' . $email);

        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.']);
    }
}
