<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
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
            'password' => 'required|string|min:6|confirmed',
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

        $token = $user->createToken('mobile_token')->plainTextToken;

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

        $token = $user->createToken('mobile_token')->plainTextToken;

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
