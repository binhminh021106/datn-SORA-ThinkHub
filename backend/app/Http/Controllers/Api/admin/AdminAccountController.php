<?php

namespace App\Http\Controllers\Api\admin;

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

        $abilities = $admin->role ? ['level:' . $admin->role->level] : ['level:5'];
        $token = $admin->createToken('admin_token', $abilities)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Đăng nhập thành công',
            'token'   => $token,
            'admin'   => $admin 
        ]);
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