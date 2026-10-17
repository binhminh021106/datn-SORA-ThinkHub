<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\Admin\Profile\AdminUpdateAdminProfileRequest;
use App\Http\Requests\Admin\Profile\AdminUpdateAdminPasswordRequest;
use Illuminate\Support\Str;

class AdminProfileController extends Controller
{
    public function updateProfile(AdminUpdateAdminProfileRequest $request)
    {
        $admin = $request->user();

        // Cập nhật thông tin text
        $admin->fullname = $request->fullname;
        $admin->phone = $request->phone;
        $admin->address = $request->address;

        // Xử lý XÓA avatar
        if ($request->has('remove_avatar') && $request->remove_avatar == 'true') {
            $this->safeDeleteAvatar($admin->avatar_url);
            $admin->avatar_url = null;
        }

        // Xử lý UPLOAD avatar mới
        if ($request->hasFile('avatar')) {
            $this->safeDeleteAvatar($admin->avatar_url);

            $file = $request->file('avatar');
            $filename = 'avatar_admin_' . $admin->id . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('avatars/admin', $filename, 'public');

            $admin->avatar_url = $path;
        }

        $admin->save();

        $admin->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hồ sơ thành công',
            'data'    => $admin
        ]);
    }

    public function updatePassword(AdminUpdateAdminPasswordRequest $request)
    {
        $admin = $request->user();

        $admin->password = Hash::make($request->new_password);
        $admin->save();

        $admin->tokens()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại!',
            'require_relogin' => true
        ]);
    }

    /**
     * Lấy thông tin profile của Admin đang đăng nhập
     */
    public function getProfile(\Illuminate\Http\Request $request)
    {
        $admin = $request->user()->load('role');

        return response()->json([
            'success' => true,
            'data' => $admin 
          ]);
    }

    private function safeDeleteAvatar($avatarUrl)
    {
        if ($avatarUrl) {
            if (!Str::startsWith($avatarUrl, ['http://', 'https://'])) {
                if (Storage::disk('public')->exists($avatarUrl)) {
                    Storage::disk('public')->delete($avatarUrl);
                }
            }
        }
    }
}
