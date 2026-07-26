<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Web app: Họ tên, email, SĐT, mật khẩu, xác nhận mật khẩu
        $request->validate([
            'fullName' => 'required|string|max:150',
            'email'    => 'required|string|email|max:150|unique:users',
            'phone'    => 'nullable|string|max:20|unique:users,phone',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'phone.unique' => 'Số điện thoại này đã được sử dụng.',
            'email.unique' => 'Email này đã được sử dụng.',
        ]);

        $user = User::create([
            'fullName' => $request->fullName,
            'email'    => $request->email,
            'phone'    => $request->phone,
            'password' => Hash::make($request->password),
            'status'   => 'active',
        ]);

        $accessToken = $user->createToken('auth_token', ['access'], now()->addMinutes(60))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message'       => 'Đăng ký thành công!',
            'access_token'  => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in'    => 3600,
            'user'          => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không chính xác.'],
            ]);
        }

        if ($user->status !== 'active') {
            throw ValidationException::withMessages([
                'email' => ['Tài khoản của bạn đã bị khóa.'],
            ]);
        }

        $accessToken = $user->createToken('auth_token', ['access'], now()->addMinutes(60))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'message'       => 'Đăng nhập thành công!',
            'access_token'  => $accessToken,
            'expires_in'    => 3600,
            'user'          => $user
        ])->cookie('refresh_token', $refreshToken, 60 * 24 * 7, '/', null, false, true, false, 'Strict');
    }

    public function logout(Request $request)
    {
        // Xóa cả access_token và refresh_token
        $request->user()->tokens()->whereIn('name', ['auth_token', 'refresh_token'])->delete();
        
        return response()->json(['message' => 'Đăng xuất thành công'])
            ->cookie(\cookie()->forget('refresh_token'));
    }

    public function refresh(Request $request)
    {
        $user = $request->user();

        // Kiểm tra xem token đang dùng có phải là refresh_token không
        if (!$user->currentAccessToken()->can('refresh')) {
            return response()->json([
                'message' => 'Token không hợp lệ để thực hiện Refresh.'
            ], 403);
        }

        // Xóa refresh_token cũ
        $user->currentAccessToken()->delete();

        // Tạo bộ token mới
        $accessToken = $user->createToken('auth_token', ['access'], now()->addMinutes(60))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'access_token'  => $accessToken,
            'expires_in'    => 3600
        ])->cookie('refresh_token', $refreshToken, 60 * 24 * 7, '/', null, false, true, false, 'Strict');
    }
}
