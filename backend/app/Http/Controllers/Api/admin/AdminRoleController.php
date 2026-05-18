<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Http\Requests\AdminStoreRoleRequest;
use App\Events\AdminRefresh;
use App\Http\Requests\AdminUpdateRoleRequest;
use Illuminate\Support\Facades\Log;

class AdminRoleController extends Controller
{
    private function broadcastUpdate()
    {
        try {
            broadcast(new AdminRefresh('roles', 'Có cập nhật mới về vai trò', now()->toDateTimeString()));
        } catch (\Exception $e) {
            Log::error("Broadcast Reverb thất bại: " . $e->getMessage());
        }
    }

    public function index()
    {
        $roles = Role::withTrashed()->orderBy('level', 'asc')->get();
        return response()->json(['success' => true, 'data' => $roles]);
    }

    public function store(AdminStoreRoleRequest $request)
    {
        try {
            $role = Role::create($request->only(['value', 'label', 'badgeClass', 'level']));
            
            $this->broadcastUpdate();

            return response()->json(['success' => true, 'message' => 'Tạo Role thành công', 'data' => $role], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function update(AdminUpdateRoleRequest $request, $id)
    {
        $role = Role::findOrFail($id);
        
        if ($role->id == 1 && $request->level != 1) {
            return response()->json(['success' => false, 'message' => 'Không thể hạ cấp quyền của Super Admin gốc!'], 403);
        }

        try {
            $role->update($request->only(['value', 'label', 'badgeClass', 'level']));
            
            $this->broadcastUpdate();

            return response()->json(['success' => true, 'message' => 'Cập nhật Role thành công', 'data' => $role]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);
        
        if ($role->id == 1) {
            return response()->json(['success' => false, 'message' => 'Tuyệt đối không thể xóa quyền Super Admin!'], 403);
        }

        $role->delete();
        
        $this->broadcastUpdate();

        return response()->json(['success' => true, 'message' => 'Đã xóa Role thành công']);
    }

    public function restore($id)
    {
        try {
            $role = Role::withTrashed()->findOrFail($id);
            $role->restore();
            
            $this->broadcastUpdate();

            return response()->json(['success' => true, 'message' => 'Đã khôi phục Role thành công']);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }
}