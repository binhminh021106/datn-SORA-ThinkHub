<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Http\Requests\AdminStoreCategoryRequest;
use App\Http\Requests\AdminUpdateCategoryRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\QueryException;

class AdminCategoryController extends Controller
{
    private function getNextSortOrder()
    {
        $max = Category::max('sort_order');
        return is_numeric($max) ? $max + 1 : 1;
    }

    /**
     * Lấy danh sách danh mục đồng bộ tối ưu ORM
     */
    public function index(Request $request)
    {
        $query = Category::query();

        if ($request->has('status') && $request->status === 'active') {
            $query->where('status', 'active'); 
        } else {
            $query->withTrashed();
        }

        // Tải eager-load liên quan danh mục cha và đếm số lượng danh mục con trực tiếp
        $categories = $query->with('parent')
            ->withCount('children')
            ->orderByRaw('sort_order IS NULL, sort_order ASC')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true, 
            'data' => $categories
        ]);
    }

    /**
     * Lấy danh sách cây danh mục hoạt động phục vụ gán danh mục cha
     */
    public function getTree()
    {
        $categories = Category::where('status', 'active')
            ->select('id', 'name', 'parent_id')
            ->orderByRaw('sort_order IS NULL, sort_order ASC')
            ->get();
            
        return response()->json([
            'success' => true, 
            'data' => $categories
        ]);
    }

    /**
     * Tạo mới danh mục
     */
    public function store(AdminStoreCategoryRequest $request)
    {
        try {
            $data = $request->validated();

            $status = $data['status'] ?? 'active';
            $data['sort_order'] = ($status === 'active') ? $this->getNextSortOrder() : null;

            if ($request->hasFile('thumbnail')) {
                $data['thumbnail'] = $request->file('thumbnail')->store('categories', 'public');
            }

            if ($request->has('attributes_schema')) {
                $parsedSchema = json_decode($request->input('attributes_schema'), true);
                $data['attributes_schema'] = is_array($parsedSchema) ? $parsedSchema : [];
            }

            $category = Category::create($data);
            $category->load('parent');

            return response()->json([
                'success' => true, 
                'message' => 'Tạo danh mục thành công!', 
                'data' => $category
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chi tiết danh mục
     */
    public function show($id)
    {
        $category = Category::withTrashed()->with('parent')->findOrFail($id);
        return response()->json([
            'success' => true, 
            'data' => $category
        ]);
    }

    /**
     * Cập nhật thông tin danh mục
     */
    public function update(AdminUpdateCategoryRequest $request, $id)
    {
        try {
            $category = Category::withTrashed()->findOrFail($id);
            $data = $request->validated();

            if (isset($data['status']) && $category->status !== $data['status']) {
                if ($data['status'] === 'active') {
                    $data['sort_order'] = $this->getNextSortOrder();
                } else {
                    $data['sort_order'] = null;
                }
            }

            if ($request->hasFile('thumbnail')) {
                if ($category->thumbnail && Storage::disk('public')->exists($category->thumbnail)) {
                    Storage::disk('public')->delete($category->thumbnail);
                }
                $data['thumbnail'] = $request->file('thumbnail')->store('categories', 'public');
            } elseif (filter_var($request->input('remove_thumbnail'), FILTER_VALIDATE_BOOLEAN)) {
                if ($category->thumbnail && Storage::disk('public')->exists($category->thumbnail)) {
                    Storage::disk('public')->delete($category->thumbnail);
                }
                $data['thumbnail'] = null;
            }

            if ($request->has('attributes_schema')) {
                $parsedSchema = json_decode($request->input('attributes_schema'), true);
                $data['attributes_schema'] = is_array($parsedSchema) ? $parsedSchema : [];
            }

            $category->update($data);
            $category->load('parent');

            return response()->json([
                'success' => true, 
                'message' => 'Cập nhật danh mục thành công!',
                'data' => $category
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                return response()->json([
                    'success' => false, 
                    'message' => 'Tên danh mục hoặc đường dẫn (slug) đã tồn tại trong hệ thống.', 
                    'errors' => ['name' => ['Tên danh mục hoặc slug đã được sử dụng.']]
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * Xóa mềm danh mục
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);

        $activeChildrenCount = Category::where('parent_id', $id)->count();
        if ($activeChildrenCount > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Không thể xóa! Danh mục này đang chứa ' . $activeChildrenCount . ' danh mục con. Hãy chuyển danh mục con sang nơi khác trước.'
            ], 400);
        }

        $category->sort_order = null;
        $category->slug = $category->slug . '-deleted-' . time();
        $category->save();
        $category->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Đã chuyển danh mục vào thùng rác!'
        ]);
    }

    /**
     * Khôi phục danh mục từ thùng rác
     */
    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);

        $originalSlug = preg_replace('/-deleted-\d+$/', '', $category->slug);
        if (Category::where('slug', $originalSlug)->whereNull('deleted_at')->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Tên danh mục này đã được sử dụng bởi một danh mục khác trong thời gian bị xóa.'
            ], 400);
        }

        $category->slug = $originalSlug;

        if ($category->status === 'active') {
            $category->sort_order = $this->getNextSortOrder();
        }

        $category->save();
        $category->restore();

        return response()->json([
            'success' => true, 
            'message' => 'Khôi phục danh mục thành công!',
            'data' => $category
        ]);
    }

    /**
     * Sắp xếp kéo thả đồng bộ
     */
    public function reorder(Request $request)
    {
        $request->validate([
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.sort_order' => 'required|integer|min:1'
        ]);

        try {
            DB::transaction(function () use ($request) {
                foreach ($request->categories as $item) {
                    Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
                }
            });
            return response()->json([
                'success' => true, 
                'message' => 'Cập nhật thứ tự hiển thị thành công!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi hệ thống: ' . $e->getMessage()
            ], 500);
        }
    }
}