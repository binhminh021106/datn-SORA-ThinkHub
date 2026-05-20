<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Http\Requests\AdminStoreAdminRequest;
use App\Http\Requests\AdminUpdateAdminRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;

class AdminStaffController extends Controller
{
    /**
     * Lấy danh sách toàn bộ nhân sự (bao gồm cả tài khoản đã xóa mềm) kèm chức vụ.
     */
    public function index()
    {
        // Sử dụng Eloquent ORM tải eagers-load quan hệ 'role' và sắp xếp tối ưu
        $staffs = Admin::withTrashed()
            ->with('role')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $staffs
        ]);
    }

    /**
     * Thêm mới tài khoản nhân viên.
     */
    public function store(AdminStoreAdminRequest $request)
    {
        $data = $request->except(['password', 'avatar']);
        $data['password'] = Hash::make($request->password);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_url'] = $path;
        }

        $admin = Admin::create($data);
        
        // Tải thông tin chức vụ kèm theo để phản hồi ngay lập tức cho Frontend cache
        $admin->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Tạo tài khoản thành công!',
            'data' => $admin
        ], 201);
    }

    /**
     * Lấy thông tin chi tiết một nhân sự.
     */
    public function show($id)
    {
        $admin = Admin::withTrashed()->with('role')->findOrFail($id);
        return response()->json([
            'success' => true,
            'data' => $admin
        ]);
    }

    /**
     * Cập nhật thông tin nhân viên (Hỗ trợ cập nhật nhanh trạng thái qua API).
     */
    public function update(AdminUpdateAdminRequest $request, $id)
    {
        $admin = Admin::findOrFail($id);

        if ($admin->id == 1 && Auth::id() != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền sửa tài khoản Super Admin gốc!'
            ], 403);
        }

        $data = $request->except(['password', 'avatar', '_method', 'remove_avatar']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        if ($request->hasFile('avatar')) {
            if ($admin->avatar_url && Storage::disk('public')->exists($admin->avatar_url)) {
                Storage::disk('public')->delete($admin->avatar_url);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_url'] = $path;
        } elseif ($request->input('remove_avatar') == 'true') {
            if ($admin->avatar_url && Storage::disk('public')->exists($admin->avatar_url)) {
                Storage::disk('public')->delete($admin->avatar_url);
            }
            $data['avatar_url'] = null;
        }

        $admin->update($data);
        $admin->load('role'); // Đồng bộ lại role sau khi cập nhật dữ liệu

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật tài khoản thành công!',
            'data' => $admin
        ]);
    }

    /**
     * Đưa tài khoản vào thùng rác (Xóa mềm - Soft Delete).
     */
    public function destroy($id)
    {
        $admin = Admin::findOrFail($id);

        if ($admin->id == 1) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa Super Admin gốc!'
            ], 403);
        }

        if ($admin->id == Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không thể tự xóa chính mình!'
            ], 400);
        }

        $admin->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Đã chuyển tài khoản vào thùng rác!',
            'id' => $id
        ]);
    }

    /**
     * Khôi phục tài khoản nhân viên từ trạng thái xóa mềm.
     */
    public function restore($id)
    {
        $admin = Admin::withTrashed()->findOrFail($id);
        $admin->restore();
        $admin->load('role');

        return response()->json([
            'success' => true,
            'message' => 'Đã khôi phục tài khoản nhân viên thành công!',
            'data' => $admin
        ]);
    }
}