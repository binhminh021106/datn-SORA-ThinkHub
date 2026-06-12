<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ModulePermission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;

class AdminModulePermissionController extends Controller
{
    // Lấy toàn bộ danh sách trang hiện có
    public function index()
    {
        $modules = ModulePermission::all();
        return response()->json(['success' => true, 'data' => $modules]);
    }

    public function sync()
    {
        $configModules = Config::get('modules', []);
        $syncedCount = 0;

        foreach ($configModules as $mod) {
            $existing = ModulePermission::where('module_code', $mod['module_code'])->first();
            
            if (!$existing) {
                ModulePermission::create([
                    'module_name' => $mod['module_name'],
                    'module_code' => $mod['module_code'],
                    'required_level' => $mod['default_level']
                ]);
                $syncedCount++;
            }
        }

        return response()->json([
            'success' => true, 
            'message' => $syncedCount > 0 ? "Đã đồng bộ $syncedCount module mới vào hệ thống." : "Hệ thống đã đồng bộ đầy đủ, không có module mới."
        ]);
    }

    public function updateLevel(Request $request, $id)
    {
        $request->validate([
            'required_level' => 'required|integer|min:1'
        ]);

        $module = ModulePermission::findOrFail($id);
        $module->update(['required_level' => $request->required_level]);

        return response()->json(['success' => true, 'message' => 'Cập nhật cấp độ yêu cầu thành công.']);
    }
}