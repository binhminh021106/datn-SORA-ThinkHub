<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Exception;
use Illuminate\Http\Request;

class GoogleAuthController extends Controller
{
    // Chuyển hướng người dùng sang Google
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    // Xử lý callback từ Google trả về
    public function callback()
    {
        try {
            // Lấy thông tin user từ Google
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Tìm hoặc tạo user mới trong hệ thống
            $user = User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'fullName' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'avatar_url' => $googleUser->avatar,
                    'password' => null 
                ]
            );

            // Generate a secure one-time exchange code
            $exchangeCode = Str::random(64);
            
            // Store it in cache for 2 minutes mapped to the user ID
            Cache::put('google_auth_exchange_' . $exchangeCode, $user->id, now()->addMinutes(2));

            // Chuyển hướng người dùng về frontend với code
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/auth/google/callback?code=' . $exchangeCode;
            return redirect($frontendUrl);

        } catch (Exception $e) {
            // dd($e->getMessage());
            return redirect()->away(env('FRONTEND_URL') . '/login?error=google_auth_failed');
        }
    }

    public function exchange(Request $request)
    {
        $request->validate([
            'code' => 'required|string'
        ]);

        $lock = Cache::lock('lock_google_auth_exchange_' . $request->code, 5);

        if (!$lock->get()) {
            return response()->json(['message' => 'Yêu cầu đang được xử lý.'], 429);
        }

        try {
            $userId = Cache::pull('google_auth_exchange_' . $request->code);

            if (!$userId) {
                return response()->json(['message' => 'Mã xác thực không hợp lệ hoặc đã hết hạn.'], 400);
            }

        $user = User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'Người dùng không tồn tại.'], 404);
        }

        if ($user->status !== 'active') {
            return response()->json(['message' => 'Tài khoản của bạn đã bị khóa.'], 403);
        }

        $accessToken = $user->createToken('auth_token', ['access'], now()->addMinutes(60))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message'       => 'Đăng nhập Google thành công!',
            'access_token'  => $accessToken,
            'expires_in'    => 3600,
            'user'          => $user
        ])->cookie('refresh_token', $refreshToken, 60 * 24 * 7, '/', null, true, true, false, 'Strict');
        
        } finally {
            $lock->release();
        }
    }
}