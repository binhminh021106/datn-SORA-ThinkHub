<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Controller xử lý Đăng ký / Đăng nhập riêng cho Mobile App
 * Khác với AuthController (web): form đăng ký KHÔNG yêu cầu số điện thoại
 */
class MobileAuthController extends Controller
{
    public function register(Request $request)
    {
        // Mobile app: Họ tên, email, mật khẩu, xác nhận mật khẩu (không có SĐT)
        $request->validate([
            'fullName' => 'required|string|max:150',
            'email'    => 'required|string|email|max:150|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'fullName.required' => 'Vui lòng nhập họ và tên.',
            'email.required'    => 'Vui lòng nhập email.',
            'email.email'       => 'Email không đúng định dạng.',
            'email.unique'      => 'Email này đã được sử dụng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
            'password.min'      => 'Mật khẩu phải có ít nhất 6 ký tự.',
            'password.confirmed'=> 'Mật khẩu xác nhận không khớp.',
        ]);

        $user = User::create([
            'fullName' => $request->fullName,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'status'   => 'active',
        ]);

        $token = $user->createToken('mobile_token', ['access'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'message'      => 'Đăng ký thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => [
                'id'       => $user->id,
                'fullName' => $user->fullName,
                'email'    => $user->email,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|string|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'Vui lòng nhập email.',
            'email.email'       => 'Email không đúng định dạng.',
            'password.required' => 'Vui lòng nhập mật khẩu.',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không chính xác.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'],
            ]);
        }

        // Thu hồi token cũ (đăng nhập 1 thiết bị) - tuỳ chọn
        // $user->tokens()->delete();

        $token = $user->createToken('mobile_token', ['access'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'message'      => 'Đăng nhập thành công!',
            'access_token' => $token,
            'token_type'   => 'Bearer',
            'user'         => [
                'id'       => $user->id,
                'fullName' => $user->fullName,
                'email'    => $user->email,
                'phone'    => $user->phone,
            ],
        ]);
    }

    public function googleLogin(Request $request)
    {
        $request->validate([
            'id_token' => 'required|string',
        ], [
            'id_token.required' => 'Thiếu mã xác thực Google.',
        ]);

        $googleClientId = config('services.google.client_id');
        if (!$googleClientId) {
            return response()->json([
                'message' => 'Máy chủ chưa cấu hình Google Client ID.',
            ], 500);
        }

        $googleResponse = Http::timeout(10)->get('https://oauth2.googleapis.com/tokeninfo', [
            'id_token' => $request->id_token,
        ]);

        if (!$googleResponse->ok()) {
            throw ValidationException::withMessages([
                'google' => ['Mã đăng nhập Google không hợp lệ hoặc đã hết hạn.'],
            ]);
        }

        $googleUser = $googleResponse->json();
        if (($googleUser['aud'] ?? null) !== $googleClientId) {
            throw ValidationException::withMessages([
                'google' => ['Google Client ID không khớp với hệ thống SORA.'],
            ]);
        }

        if (($googleUser['email_verified'] ?? 'false') !== 'true') {
            throw ValidationException::withMessages([
                'google' => ['Email Google của bạn chưa được xác thực.'],
            ]);
        }

        $email = $googleUser['email'] ?? null;
        if (!$email) {
            throw ValidationException::withMessages([
                'google' => ['Không lấy được email từ tài khoản Google.'],
            ]);
        }

        $user = User::firstOrNew(['email' => $email]);

        if ($user->exists && $user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.'],
            ]);
        }

        $user->fullName = $user->fullName ?: ($googleUser['name'] ?? $email);
        $user->google_id = $googleUser['sub'] ?? $user->google_id;
        $user->avatar_url = $googleUser['picture'] ?? $user->avatar_url;
        $user->email_verified_at = $user->email_verified_at ?: now();
        $user->status = $user->status ?: 'active';
        $user->save();

        $token = $user->createToken('mobile_token', ['access'], now()->addDays(30))->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập Google thành công!',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'fullName' => $user->fullName,
                'email' => $user->email,
                'phone' => $user->phone,
                'avatar_url' => $user->avatar_url,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    public function me(Request $request)
    {
        $user = User::with('tier')->find($request->user()->id);
        
        $userData = $user->toArray();
        if ($user->avatar_url && !str_starts_with($user->avatar_url, 'http')) {
            $userData['avatar_url'] = url('storage/' . $user->avatar_url);
        }

        // Đính kèm URL đầy đủ cho icon tier (nếu có)
        if ($user->tier && $user->tier->icon) {
            $userData['tier']['icon_url'] = url('storage/' . $user->tier->icon);
        }

        // Trả thêm danh sách toàn bộ hạng thành viên (để hiển thị progress)
        $allTiers = \App\Models\MembershipTier::orderBy('min_spent', 'asc')->get()->map(function ($t) {
            $t->icon_url = $t->icon ? url('storage/' . $t->icon) : null;
            return $t;
        });
        $userData['all_tiers'] = $allTiers;

        return response()->json([
            'user' => $userData
        ]);
    }
}
