<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Http\Requests\AdminStoreProductRequest;
use App\Http\Requests\AdminUpdateProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Events\ProductUpdated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();

        if (!$request->has('status')) {
            $query->withTrashed();
        }

        if ($request->has('status') && $request->status === 'published') {
            $query->availableForConfig();
        } elseif ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // TỐI ƯU ORM ĐỂ KẾT HỢP TANSTACK QUERY:
        // Thay vì SELECT * kéo theo các cột description, content (chứa HTML/Base64 nặng nề),
        // Ta chỉ lấy đúng các trường cơ bản phục vụ cho Datatable List.
        // Bắt buộc phải có category_id và brand_id để Eloquent có thể map dữ liệu với hàm with()
        $products = $query->select(
                'id', 'name', 'slug', 'base_price', 'promotional_price', 
                'thumbnail_image', 'status', 'category_id', 'brand_id', 'deleted_at', 'created_at'
            )
            ->with(['category:id,name', 'brand:id,name'])
            ->withCount('variants')
            ->withSum('variants as total_stock', 'stock_quantity')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show($id)
    {
        // Ở hàm Show (dùng cho QuickView hoặc Form Edit), ta BẮT BUỘC phải lấy toàn bộ dữ liệu 
        // (bao gồm description, specs...) nên giữ nguyên SELECT *.
        $product = Product::with([
            'category:id,name',
            'brand:id,name',
            'variants.attributeValues'
        ])->findOrFail($id);

        $product->variants->transform(function ($variant) {
            $attrMap = [];
            foreach ($variant->attributeValues as $val) {
                $attrMap[$val->attribute_id] = $val->id;
            }
            $variant->attributes = $attrMap;
            unset($variant->attributeValues);
            return $variant;
        });

        $product->total_stock = $product->variants->sum('stock_quantity');
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function store(AdminStoreProductRequest $request)
    {
        try {
            DB::beginTransaction();
            $data = $request->validated();

            $file = $request->file('thumbnail_image');
            $fileName = 'prod_' . Str::slug($data['name']) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $data['thumbnail_image'] = $file->storeAs('products/thumbnails', $fileName, 'public');

            $product = Product::create($data);
            $variantsData = json_decode($request->variants_data, true);

            foreach ($variantsData as $index => $vData) {
                $variantImagePath = null;
                $imageKey = 'variant_image_' . $index;
                
                if ($request->hasFile($imageKey)) {
                    $vFile = $request->file($imageKey);
                    $vFileName = 'var_' . Str::slug($vData['sku']) . '_' . time() . '.' . $vFile->getClientOriginalExtension();
                    $variantImagePath = $vFile->storeAs('products/variants', $vFileName, 'public');
                }

                $variant = ProductVariant::create([
                    'product_id' => $product->id,
                    'sku' => $vData['sku'],
                    'price' => $vData['price'],
                    'promotional_price' => $vData['promotional_price'] ?: null,
                    'stock_quantity' => $vData['stock_quantity'],
                    'image_url' => $variantImagePath,
                    'is_default' => $index === 0 ? 1 : 0
                ]);

                if (!empty($vData['attributes']) && is_array($vData['attributes'])) {
                    $variant->attributeValues()->sync(array_values($vData['attributes']));
                }
            }

            DB::commit();
            event(new ProductUpdated($product->id, ['action' => 'created']));
            return response()->json(['success' => true, 'message' => 'Xuất bản sản phẩm thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function update(AdminUpdateProductRequest $request, $id)
    {
        try {
            DB::beginTransaction();
            $product = Product::findOrFail($id);

            $data = $request->validated();
            unset($data['variants_data']);

            if ($request->hasFile('thumbnail_image')) {
                if ($product->thumbnail_image) Storage::disk('public')->delete($product->thumbnail_image);
                $file = $request->file('thumbnail_image');
                $fileName = 'prod_' . Str::slug($data['name']) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $data['thumbnail_image'] = $file->storeAs('products/thumbnails', $fileName, 'public');
            }

            $product->update($data);

            $variantsData = json_decode($request->variants_data, true);
            $incomingVariantIds = array_filter(array_column($variantsData, 'id'));

            ProductVariant::where('product_id', $product->id)
                ->whereNotIn('id', $incomingVariantIds)
                ->delete();

            foreach ($variantsData as $index => $vData) {
                $variantImagePath = $vData['current_image'] ?? null;
                $imageKey = 'variant_image_' . $index;

                if ($request->hasFile($imageKey)) {
                    $vFile = $request->file($imageKey);
                    $vFileName = 'var_' . Str::slug($vData['sku']) . '_' . time() . '.' . $vFile->getClientOriginalExtension();
                    $variantImagePath = $vFile->storeAs('products/variants', $vFileName, 'public');
                }

                $variantPayload = [
                    'sku' => $vData['sku'],
                    'price' => $vData['price'],
                    'promotional_price' => $vData['promotional_price'] ?: null,
                    'stock_quantity' => $vData['stock_quantity'],
                    'image_url' => $variantImagePath,
                ];

                if (!empty($vData['id'])) {
                    $variant = ProductVariant::find($vData['id']);
                    if ($variant) $variant->update($variantPayload);
                } else {
                    $variantPayload['product_id'] = $product->id;
                    $variantPayload['is_default'] = $index === 0 ? 1 : 0;
                    $variant = ProductVariant::create($variantPayload);
                }

                if ($variant && !empty($vData['attributes']) && is_array($vData['attributes'])) {
                    $variant->attributeValues()->sync(array_values($vData['attributes']));
                }
            }

            DB::commit();
            event(new ProductUpdated($product->id, ['action' => 'updated']));
            return response()->json(['success' => true, 'message' => 'Cập nhật sản phẩm thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $product = Product::findOrFail($id);
            $product->variants()->delete();
            $product->delete();

            DB::commit();
            event(new ProductUpdated($product->id, ['action' => 'deleted']));
            return response()->json(['success' => true, 'message' => 'Sản phẩm và Biến thể đã vào thùng rác']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function restore($id)
    {
        DB::beginTransaction();
        try {
            $product = Product::withTrashed()->findOrFail($id);
            $product->restore();
            $product->variants()->withTrashed()->restore();

            DB::commit();
            event(new ProductUpdated($product->id, ['action' => 'restored']));
            return response()->json(['success' => true, 'message' => 'Sản phẩm và Biến thể đã được khôi phục']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}