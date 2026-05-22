<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Http\Requests\AdminStoreBrandRequest;
use App\Http\Requests\AdminUpdateBrandRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Database\QueryException;

class AdminBrandController extends Controller
{
    private function getNextSortOrder()
    {
        $max = Brand::max('sort_order');
        return is_numeric($max) ? $max + 1 : 1;
    }

    /**
     * Lấy danh sách thương hiệu đồng bộ tối ưu ORM
     */
    public function index(Request $request)
    {
        $query = Brand::query();

        if ($request->has('status') && $request->status === 'active') {
            $query->where('status', 'active');
        } else {
            $query->withTrashed();
        }

        // Tải eager-load đếm số sản phẩm liên quan và sắp xếp tối ưu
        $brands = $query->withCount('products')
            ->orderByRaw('sort_order IS NULL, sort_order ASC') 
            ->orderBy('id', 'desc') 
            ->get();
            
        return response()->json([
            'success' => true, 
            'data' => $brands
        ]);
    }

    /**
     * Tạo mới thương hiệu
     */
    public function store(AdminStoreBrandRequest $request)
    {
        $data = $request->validated();

        $data['sort_order'] = ($data['status'] === 'active') ? $this->getNextSortOrder() : null;

        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $fileName = 'brand_' . Str::slug($data['name']) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $data['logo'] = $file->storeAs('brands', $fileName, 'public');
        }

        $brand = Brand::create($data);
        $brand->loadCount('products'); // Tải thông tin count bổ trợ cho cache FE

        return response()->json([
            'success' => true, 
            'message' => 'Tạo thương hiệu thành công', 
            'data' => $brand
        ]);
    }

    /**
     * Chi tiết thương hiệu
     */
    public function show($id)
    {
        $brand = Brand::withTrashed()->withCount('products')->findOrFail($id);
        return response()->json([
            'success' => true, 
            'data' => $brand
        ]);
    }

    /**
     * Cập nhật thông tin đối tác thương hiệu
     */
    public function update(AdminUpdateBrandRequest $request, $id)
    {
        try {
            $brand = Brand::withTrashed()->findOrFail($id);
            $data = $request->validated();

            if ($brand->status !== $data['status']) {
                if ($data['status'] === 'active') {
                    $data['sort_order'] = $this->getNextSortOrder();
                } else {
                    $data['sort_order'] = null;
                }
            }

            if ($request->hasFile('logo')) {
                $file = $request->file('logo');
                $fileName = 'brand_' . Str::slug($data['name']) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $data['logo'] = $file->storeAs('brands', $fileName, 'public');
                if ($brand->logo) {
                    Storage::disk('public')->delete($brand->logo);
                }
            }

            $brand->update($data);
            $brand->loadCount('products');

            return response()->json([
                'success' => true, 
                'message' => 'Cập nhật thành công', 
                'data' => $brand
            ]);
        } catch (QueryException $e) {
            if ($e->getCode() == 23000) {
                $message = 'Tên hoặc slug này đã bị trùng với thương hiệu khác.';
                return response()->json([
                    'success' => false, 
                    'message' => $message, 
                    'errors' => ['duplicate' => [$message]]
                ], 422);
            }
            throw $e;
        }
    }

    /**
     * Xóa mềm thương hiệu
     */
    public function destroy($id)
    {
        $brand = Brand::findOrFail($id);
        $brand->update(['sort_order' => null]);
        $brand->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Đã đưa thương hiệu vào thùng rác',
            'id' => $id
        ]);
    }

    /**
     * Khôi phục thương hiệu từ thùng rác
     */
    public function restore($id)
    {
        $brand = Brand::withTrashed()->findOrFail($id);
        $brand->restore();

        if ($brand->status === 'active') {
            $brand->update(['sort_order' => $this->getNextSortOrder()]);
        }
        $brand->loadCount('products');

        return response()->json([
            'success' => true, 
            'message' => 'Đã khôi phục thương hiệu',
            'data' => $brand
        ]);
    }

    /**
     * Lưu thứ tự kéo thả của đối tác hoạt động
     */
    public function reorder(Request $request)
    {
        $items = $request->items;
        foreach ($items as $item) {
            Brand::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }
        return response()->json([
            'success' => true, 
            'message' => 'Đã cập nhật thứ tự'
        ]);
    }
}