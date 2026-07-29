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
        $rateLimitKey = 'send-otp:' . hash('sha256', $email);

        // Chống spam: Tối đa 1 lần / 2 phút
        if (RateLimiter::tooManyAttempts($rateLimitKey, 1)) {
            $seconds = RateLimiter::availableIn($rateLimitKey);
            return response()->json(['message' => "Hệ thống đang xử lý. Vui lòng thử lại sau {$seconds} giây."], 429);
        }
        RateLimiter::hit($rateLimitKey, 120);

        // Chỉ tạo và gửi OTP nếu User tồn tại trong hệ thống
        $user = User::where('email', $email)->first();
        if ($user) {
            $otp = sprintf("%06d", random_int(100000, 999999));

            $expiresAt = now()->addMinutes(5);

            Cache::put($this->otpCacheKey($email), [
                'otp_hash' => $this->otpHash($otp),
                'attempts' => 0,
                'expires_at' => $expiresAt,
            ], $expiresAt);

            // Gửi email
            try {
                Mail::to($email)->send(new UserForgotPasswordOtpMail($otp));
            } catch (\Exception $e) {
                Cache::forget($this->otpCacheKey($email));
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
        $otpRateKey = 'verify-otp:' . hash('sha256', $email);
        $cacheKey = $this->otpCacheKey($email);
        $lock = Cache::lock('user-password-reset-otp-lock:' . hash('sha256', $email), 10);

        if (! $lock->get()) {
            return response()->json(['message' => 'Yêu cầu đang được xử lý. Vui lòng thử lại sau.'], 429);
        }

        try {

        // Chống Brute-force: Khóa 5 phút nếu sai 5 lần
        if (RateLimiter::tooManyAttempts($otpRateKey, 5)) {
            return response()->json(['message' => 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 5 phút.'], 403);
        }

        $cacheData = Cache::get($cacheKey);

        // 1. Lỗi: Hết hạn hoặc không tồn tại
        if (!$cacheData) {
            return response()->json(['message' => 'Mã OTP đã hết hạn hoặc không tồn tại. Vui lòng gửi lại.'], 400);
        }

        // 2. Lỗi: Vượt quá số lần cho phép trong cùng 1 vòng đời OTP
        if ($cacheData['attempts'] >= 5) {
            Cache::forget($cacheKey);
            return response()->json(['message' => 'Bạn đã nhập sai quá nhiều lần. Mã OTP đã bị hủy để bảo mật.'], 403);
        }

        // 3. Lỗi: OTP Sai
        $storedOtpHash = (string) ($cacheData['otp_hash'] ?? '');
        $isValidOtp = $storedOtpHash !== ''
            ? hash_equals($storedOtpHash, $this->otpHash($otp))
            : hash_equals((string) ($cacheData['otp'] ?? ''), (string) $otp);

        if (! $isValidOtp) {
            $cacheData['attempts']++;
            if ($cacheData['attempts'] >= 5) {
                Cache::forget($cacheKey);
            } else {
                Cache::put($cacheKey, $cacheData, $cacheData['expires_at'] ?? now());
            }
            RateLimiter::hit($otpRateKey, 300);
            $attemptsLeft = 5 - $cacheData['attempts'];
            return response()->json(['message' => "Mã OTP không chính xác. Bạn còn {$attemptsLeft} lần thử."], 400);
        }

        // 4. THÀNH CÔNG: Xóa OTP, sinh Token bảo mật để đi tiếp Bước 3
        Cache::forget($cacheKey);
        RateLimiter::clear($otpRateKey);

        $resetToken = Str::random(60);
        // Token sống 15 phút
        Cache::put($this->resetTokenCacheKey($email), [
            'token_hash' => hash('sha256', $resetToken),
        ], now()->addMinutes(15));

        return response()->json([
            'success' => true, 
            'message' => 'Xác thực OTP thành công.',
            'reset_token' => $resetToken
        ]);
        } finally {
            $lock->release();
        }
    }

    /**
     * BƯỚC 3: ĐẶT LẠI MẬT KHẨU
     */
    public function resetPassword(ResetPasswordRequest $request)
    {
        $email = $request->validated('email');
        $resetToken = $request->validated('reset_token');
        $newPassword = $request->validated('password');
        $lock = Cache::lock('user-password-reset-token-lock:' . hash('sha256', $email), 15);

        if (! $lock->get()) {
            return response()->json(['message' => 'Yêu cầu đang được xử lý. Vui lòng thử lại sau.'], 429);
        }

        try {

        $validToken = Cache::get($this->resetTokenCacheKey($email));

        // Kiểm tra Token
        if (!$validToken) {
            return response()->json(['message' => 'Phiên làm việc đã hết hạn. Vui lòng yêu cầu lại OTP.'], 403);
        }

        $validTokenHash = is_array($validToken)
            ? (string) ($validToken['token_hash'] ?? '')
            : hash('sha256', (string) $validToken);

        if (!hash_equals($validTokenHash, hash('sha256', $resetToken))) {
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
        Cache::forget($this->resetTokenCacheKey($email));

        return response()->json(['success' => true, 'message' => 'Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay.']);
        } finally {
            $lock->release();
        }
    }

    private function otpCacheKey(string $email): string
    {
        return 'user_password_reset_otp_' . hash('sha256', $email);
    }

    private function resetTokenCacheKey(string $email): string
    {
        return 'user_password_reset_token_' . hash('sha256', $email);
    }

    private function otpHash(string $otp): string
    {
        return hash_hmac('sha256', $otp, (string) config('app.key'));
    }
}
