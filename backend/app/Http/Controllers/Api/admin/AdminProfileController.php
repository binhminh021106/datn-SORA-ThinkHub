<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use App\Http\Requests\AdminUpdateAdminProfileRequest;
use App\Http\Requests\AdminUpdateAdminPasswordRequest;
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
        // Lấy thông tin admin từ token hiện tại kèm theo chức vụ (role)
        $admin = $request->user()->load('role');

        return response()->json([
            'success' => true,
            'data' => $admin // Header.vue sẽ nhận data này để hiển thị avatar và tên
        ]);
    }

    private function safeDeleteAvatar($avatarUrl)
    {
        if ($avatarUrl) {
            // Không xóa nếu avatar là link HTTP (vd: đăng nhập bằng Google)
            if (!Str::startsWith($avatarUrl, ['http://', 'https://'])) {
                if (Storage::disk('public')->exists($avatarUrl)) {
                    Storage::disk('public')->delete($avatarUrl);
                }
            }
        }
    }
}
