<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminPermission
{
    public function handle(Request $request, Closure $next, $permissionId): Response
    {
        $admin = $request->user();

        $hasPermission = DB::table('role_permissions')
            ->where('role_id', $admin->role_id)
            ->where('permission_id', $permissionId)
            ->exists();

        if (!$hasPermission && $admin->role_id != 1) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền truy cập chức năng này (Yêu cầu quyền cấp ' . $permissionId . ').'
            ], 403);
        }

        return $next($request);
    }
}