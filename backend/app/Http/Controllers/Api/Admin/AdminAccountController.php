<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminAccount\AdminStoreAdminRequest;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAccountController extends Controller
{
    public function store(AdminStoreAdminRequest $request)
    {
        $validatedData = $request->validated();
        $validatedData['password'] = Hash::make($validatedData['password']);
        $validatedData['email_verified_at'] = now();
        $validatedData['role_id'] = 12;
        $validatedData['status'] = 'active';

        $admin = Admin::create($validatedData);
        $admin->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Tạo tài khoản quản trị thành công',
            'data'    => $admin
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $admin = Admin::with('role')->where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['success' => false, 'message' => 'Email hoặc mật khẩu không chính xác'], 401);
        }

        if ($admin->status !== 'active') {
            return response()->json(['success' => false, 'message' => 'Tài khoản của bạn đã bị khóa'], 403);
        }

        $accessAbilities = $admin->role ? ['level:' . $admin->role->level, 'access'] : ['level:5', 'access'];
        $accessToken = $admin->createToken('admin_token', $accessAbilities, now()->addMinutes(60))->plainTextToken;
        $refreshToken = $admin->createToken('admin_refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success'       => true,
            'message'       => 'Đăng nhập thành công',
            'token'         => $accessToken,
            'access_token'  => $accessToken,
            'expires_in'    => 3600,
            'admin'         => $admin 
        ])->cookie('admin_refresh_token', $refreshToken, 60 * 24 * 7, '/', null, true, true, false, 'Strict');
    }

    public function refresh(Request $request)
    {
        $admin = $request->user();

        if (!$admin->currentAccessToken()->can('refresh')) {
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ để thực hiện Refresh.'
            ], 403);
        }

        if ($admin->status !== 'active') {
            $admin->tokens()->delete();
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị khóa'
            ], 403);
        }

        $admin->currentAccessToken()->delete();

        $accessAbilities = $admin->role ? ['level:' . $admin->role->level, 'access'] : ['level:5', 'access'];
        $accessToken = $admin->createToken('admin_token', $accessAbilities, now()->addMinutes(60))->plainTextToken;
        $refreshToken = $admin->createToken('admin_refresh_token', ['refresh'], now()->addDays(7))->plainTextToken;

        return response()->json([
            'success'       => true,
            'token'         => $accessToken,
            'access_token'  => $accessToken,
            'expires_in'    => 3600
        ])->cookie('admin_refresh_token', $refreshToken, 60 * 24 * 7, '/', null, true, true, false, 'Strict');
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->whereIn('name', ['admin_token', 'admin_refresh_token'])->delete();
        return response()->json(['success' => true, 'message' => 'Đăng xuất thành công'])
            ->cookie(\cookie()->forget('admin_refresh_token'));
    }

    public function me(Request $request)
    {
        $admin = $request->user()->load('role');
        
        return response()->json([
            'success' => true,
            'data'    => $admin
        ]);
    }

    public function restore($id)
    {
        try {
            $admin = Admin::withTrashed()->findOrFail($id);
            $admin->restore();
            
            return response()->json([
                'success' => true, 
                'message' => 'Khôi phục tài khoản thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}