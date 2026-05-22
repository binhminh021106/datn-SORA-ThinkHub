<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerGallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminCustomerGalleryController extends Controller
{
    // Lấy danh sách ảnh cho Admin (Đã bỏ withTrashed gây lỗi 500)
    public function index()
    {
        $galleries = CustomerGallery::orderBy('sort_order', 'asc')
                                    ->orderBy('created_at', 'desc')
                                    ->get();
        return response()->json(['success' => true, 'data' => $galleries]);
    }

    // Lấy thông tin 1 ảnh để hiển thị lên form Sửa (Vue Edit)
    public function show($id)
    {
        try {
            $gallery = CustomerGallery::findOrFail($id);
            return response()->json(['success' => true, 'data' => $gallery]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy hình ảnh này'], 404);
        }
    }

    // Upload thêm ảnh mới
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'required|image|mimes:jpeg,png,jpg,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $imagePath = $request->file('image')->store('customer_galleries', 'public');

        $gallery = CustomerGallery::create([
            'title' => $request->title, 
            'image_path' => $imagePath,
            'sort_order' => $request->sort_order ?? 0,
            'is_active' => $request->is_active ?? 1,
        ]);

        return response()->json(['success' => true, 'data' => $gallery]);
    }

    // Cập nhật ảnh / Vị trí / Trạng thái / Tiêu đề
    public function update(Request $request, $id)
    {
        $gallery = CustomerGallery::findOrFail($id);

        $request->validate([
            'title' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->has('title')) {
            $gallery->title = $request->title;
        }

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store('customer_galleries', 'public');
            if ($newImagePath) {
                if ($gallery->image_path && Storage::disk('public')->exists($gallery->image_path)) {
                    Storage::disk('public')->delete($gallery->image_path);
                }
                $gallery->image_path = $newImagePath;
            }
        }

        if ($request->has('sort_order')) {
            $gallery->sort_order = $request->sort_order;
        }
        
        if ($request->has('is_active')) {
            $gallery->is_active = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        $gallery->save();

        return response()->json(['success' => true, 'data' => $gallery]);
    }

    // Xóa ảnh (Phục hồi logic xóa vĩnh viễn gốc, dọn dẹp file vật lý)
    public function destroy($id)
    {
        $gallery = CustomerGallery::findOrFail($id);
        
        if ($gallery->image_path && Storage::disk('public')->exists($gallery->image_path)) {
            Storage::disk('public')->delete($gallery->image_path);
        }
        
        $gallery->delete();

        return response()->json(['success' => true, 'message' => 'Đã xóa ảnh thành công!']);
    }
}