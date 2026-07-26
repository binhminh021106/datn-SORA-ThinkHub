<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Exception;

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

            // Tạo Sanctum token
            $accessToken = $user->createToken('auth_token', ['access'], now()->addMinutes(60))->plainTextToken;
            $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

            // Chuyển hướng người dùng về frontend với token
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173') . '/auth/google/callback?token=' . $accessToken . '&refresh_token=' . $refreshToken;
            return redirect($frontendUrl);

        } catch (Exception $e) {
            // dd($e->getMessage());
            return redirect()->away(env('FRONTEND_URL') . '/login?error=google_auth_failed');
        }
    }
}