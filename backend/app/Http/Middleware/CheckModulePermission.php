<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\DB;

class CheckModulePermission
{
    public function handle(Request $request, Closure $next, $moduleCode): Response
    {
        $admin = $request->user();

        if (!$admin || !$admin->role_id) {
            return response()->json(['success' => false, 'message' => 'Lỗi xác thực: Không tìm thấy chức vụ của bạn.'], 401);
        }

        $role = DB::table('roles')->where('id', $admin->role_id)->first();
        if (!$role) {
            return response()->json(['success' => false, 'message' => 'Lỗi xác thực: Chức vụ của bạn không hợp lệ.'], 401);
        }
        $adminLevel = (int) $role->level;
        if ($adminLevel === 1) {
            return $next($request);
        }

        $module = DB::table('module_permissions')->where('module_code', $moduleCode)->first();

        if (!$module) {
            return response()->json(['success' => false, 'message' => "Chức năng [$moduleCode] chưa được hệ thống cấp phép. Vui lòng báo Super Admin đồng bộ hệ thống."], 403);
        }

        $requiredLevel = (int) $module->required_level;

        if ($adminLevel > $requiredLevel) {
            return response()->json(['success' => false, 'message' => 'Truy cập bị từ chối: Cấp độ của bạn không đủ để thực hiện thao tác này.'], 403);
        }

        return $next($request);
    }
}