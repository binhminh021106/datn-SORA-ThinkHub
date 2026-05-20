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
     * Lấy danh sách tin tức đồng bộ tối ưu ORM
     */
    public function index()
    {
        try {
            // Lấy cả bài viết đã xóa mềm (cho tab Đã xóa)
            $news = News::withTrashed()->orderBy('created_at', 'desc')->get();
            return response()->json([
                'success' => true,
                'status' => 'success',
                'data' => $news
            ], 200);
        } catch (\Throwable $e) { 
            return response()->json([
                'success' => false,
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
                'success' => true,
                'status' => 'success',
                'message' => 'Tạo bài viết thành công', 
                'data' => $news
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
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
        try {
            $news = News::withTrashed()->findOrFail($id);
            return response()->json([
                'success' => true,
                'data' => $news
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy bài viết.'
            ], 404);
        }
    }

    /**
     * Cập nhật bài viết
     */
    public function update(Request $request, $id)
    {
        try {
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
                'success' => true,
                'status' => 'success',
                'message' => 'Cập nhật thành công', 
                'data' => $news
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa mềm bài viết (Soft Delete)
     */
    public function destroy($id)
    {
        try {
            $news = News::findOrFail($id);
            $news->delete(); 

            event(new NewsUpdated($news->id, ['action' => 'deleted']));
            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Đã đưa bài viết vào thùng rác'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
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
            $news = News::withTrashed()->findOrFail($id);
            $news->restore(); 

            event(new NewsUpdated($news->id, ['action' => 'restored']));
            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Khôi phục bài viết thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
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
            
            $news = News::withTrashed()->findOrFail($id);
            $news->status = $request->status;
            $news->save();

            event(new NewsUpdated($news->id, ['action' => 'status_updated', 'status' => $news->status]));
            return response()->json([
                'success' => true,
                'status' => 'success',
                'message' => 'Cập nhật trạng thái thành công'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'status' => 'error',
                'message' => 'Lỗi: ' . $e->getMessage()
            ], 500);
        }
    }
}