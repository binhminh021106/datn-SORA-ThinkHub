<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\News;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use App\Events\NewsUpdated;

class AdminNewController extends Controller
{
    /**
     * Lấy danh sách tin tức cho Admin
     */
    public function index()
    {
        try {
            // Thêm withTrashed() để lấy cả bài viết đã xóa mềm (cho tab Đã xóa)
            $news = News::withTrashed()->orderBy('created_at', 'desc')->get();
            return response()->json([
                'status' => 'success',
                'data' => $news
            ], 200);
        } catch (\Throwable $e) { 
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi server: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lưu bài viết mới
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'title'             => 'required|string|max:255',
                'slug'              => 'required|string|unique:news,slug',
                'excerpt'           => 'nullable|string',
                'content'           => 'required|string',
                'author_name'       => 'required|string|max:100',
                'category'          => 'nullable|string',
                'status'            => 'required|in:pending,published,draft',
                'meta_title'        => 'nullable|string|max:255',
                'meta_description'  => 'nullable|string',
                'meta_keywords'     => 'nullable|string|max:255',
                'image'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            ]);

            if ($request->hasFile('image')) {
                $path = $request->file('image')->store('news', 'public');
                $validated['image_url'] = '/storage/' . $path;
            }

            $news = News::create($validated);
            event(new NewsUpdated($news->id, ['action' => 'created']));
            return response()->json([
                'status' => 'success',
                'message' => 'Tạo bài viết thành công', 
                'data' => $news
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật bài viết
     */
    public function update(Request $request, $id)
    {
        try {
            // Cho phép Admin cập nhật cả bài viết đang trong thùng rác
            $news = News::withTrashed()->findOrFail($id);

            $validated = $request->validate([
                'title'             => 'required|string|max:255',
                'slug'              => ['required', 'string', Rule::unique('news')->ignore($news->id)],
                'excerpt'           => 'nullable|string',
                'content'           => 'required|string',
                'author_name'       => 'required|string|max:100',
                'category'          => 'nullable|string',
                'status'            => 'required|in:pending,published,draft',
                'meta_title'        => 'nullable|string|max:255',
                'meta_description'  => 'nullable|string',
                'meta_keywords'     => 'nullable|string|max:255',
                'image'             => 'nullable|image|mimes:jpeg,png,jpg,webp|max:10240',
            ]);

            if ($request->hasFile('image')) {
                // Xóa ảnh cũ nếu tồn tại
                if ($news->image_url) {
                    $oldPath = str_replace('/storage/', '', $news->image_url);
                    Storage::disk('public')->delete($oldPath);
                }
                $path = $request->file('image')->store('news', 'public');
                $validated['image_url'] = '/storage/' . $path;
            }

            $news->update($validated);
            event(new NewsUpdated($news->id, ['action' => 'updated']));
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật thành công', 
                'data' => $news
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa bài viết (Soft Delete)
     */
    public function destroy($id)
    {
        try {
            $news = News::findOrFail($id);
            
            // Xóa file ảnh đi nếu bạn muốn dọn dẹp dung lượng. 
            // Tuy nhiên, vì đây là xóa mềm, việc giữ lại ảnh có thể tốt hơn để khôi phục sau.
            // Đoạn dưới đây bị comment để giữ lại ảnh khi xóa mềm.
            // if ($news->image_url) {
            //     $oldPath = str_replace('/storage/', '', $news->image_url);
            //     Storage::disk('public')->delete($oldPath);
            // }

            // Gọi hàm delete() sẽ đánh dấu deleted_at thay vì xóa hẳn khỏi DB
            $news->delete(); 
            event(new NewsUpdated($news->id, ['action' => 'deleted']));
            return response()->json([
                'status' => 'success',
                'message' => 'Đã đưa bài viết vào thùng rác'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Khôi phục bài viết đã xóa (Restore)
     */
    public function restore($id)
    {
        try {
            // Tìm bài viết trong thùng rác
            $news = News::withTrashed()->findOrFail($id);
            
            // Hàm khôi phục bài viết
            $news->restore(); 
            event(new NewsUpdated($news->id, ['action' => 'restored']));
            return response()->json([
                'status' => 'success',
                'message' => 'Khôi phục bài viết thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cập nhật nhanh trạng thái (Duyệt/Ẩn)
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $request->validate(['status' => 'required|in:pending,published,draft']);
            
            // Dùng withTrashed để lỡ như cần update status bài đã xoá mềm
            $news = News::withTrashed()->findOrFail($id);
            $news->status = $request->status;
            $news->save();
            event(new NewsUpdated($news->id, ['action' => 'status_updated', 'status' => $news->status]));
            return response()->json([
                'status' => 'success',
                'message' => 'Cập nhật trạng thái thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
        
    }

    /**
     * Xem chi tiết bài viết (Dùng cho giao diện Admin sửa/xem)
     */
    public function show($id)
    {
        // Thêm withTrashed() để quản trị viên có thể xem được nội dung bài viết đang nằm trong thùng rác
        $news = News::withTrashed()->findOrFail($id);
        return response()->json(['data' => $news]);
    }
}