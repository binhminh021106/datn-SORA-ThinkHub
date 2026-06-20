<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Http\Requests\Admin\Product\AdminStoreProductRequest;
use App\Http\Requests\Admin\Product\AdminUpdateProductRequest;
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
                'thumbnail_image', 'status', 'category_id', 'brand_id', 'affiliate_commission_rate',
                 'deleted_at', 'created_at'
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

            $data['affiliate_commission_rate'] = $data['affiliate_commission_rate'] ?? 0;

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
            $data['affiliate_commission_rate'] = $data['affiliate_commission_rate'] ?? 0;
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

    public function forceDelete($id)
    {
        DB::beginTransaction();
        try {
            $product = Product::withTrashed()->findOrFail($id);

            // Lấy danh sách biến thể
            $variants = $product->variants()->withTrashed()->get();
            $variantIds = $variants->pluck('id')->toArray();
            $safeVariantIds = empty($variantIds) ? [0] : $variantIds;

            // KIỂM TRA RÀNG BUỘC
            $isUsedInCombo = DB::table('combo_items')
                ->where('product_id', $id)
                ->orWhereIn('product_variant_id', $safeVariantIds)
                ->exists();
            if ($isUsedInCombo) {
                return response()->json(['success' => false, 'message' => 'Không thể xóa vĩnh viễn: Sản phẩm đang nằm trong Combo khuyến mãi.'], 400);
            }

            $isUsedInOrder = DB::table('order_items')
                ->where('product_id', $id)
                ->orWhereIn('product_variant_id', $safeVariantIds)
                ->exists();
            if ($isUsedInOrder) {
                return response()->json(['success' => false, 'message' => 'Không thể xóa vĩnh viễn: Sản phẩm đã phát sinh trong Đơn hàng.'], 400);
            }

            $isUsedInCart = false;
            if (!empty($variantIds)) {
                $isUsedInCart = DB::table('cart_items')->whereIn('product_variant_id', $variantIds)->exists();
            }
            if ($isUsedInCart) {
                return response()->json(['success' => false, 'message' => 'Không thể xóa vĩnh viễn: Sản phẩm đang nằm trong Giỏ hàng của khách.'], 400);
            }

            // XÓA FILE ẢNH VẬT LÝ
            if ($product->thumbnail_image && Storage::disk('public')->exists($product->thumbnail_image)) {
                // Không xóa ảnh placeholder mặc định
                if (!str_contains($product->thumbnail_image, 'products/defaults/')) {
                    Storage::disk('public')->delete($product->thumbnail_image);
                }
            }

            foreach ($variants as $variant) {
                if ($variant->image_url && Storage::disk('public')->exists($variant->image_url)) {
                    Storage::disk('public')->delete($variant->image_url);
                }
            }

            $productImages = DB::table('product_images')->where('product_id', $id)->get();
            foreach ($productImages as $pImg) {
                if ($pImg->image_url && Storage::disk('public')->exists($pImg->image_url)) {
                    Storage::disk('public')->delete($pImg->image_url);
                }
            }

            // XÓA DỮ LIỆU DATABASE (CASCADE)
            DB::table('product_images')->where('product_id', $id)->delete();
            
            if (!empty($variantIds)) {
                DB::table('product_variant_attributes')->whereIn('variant_id', $variantIds)->delete();
                ProductVariant::withTrashed()->where('product_id', $id)->forceDelete();
            }

            $product->forceDelete();

            DB::commit();
            return response()->json(['success' => true, 'message' => 'Sản phẩm đã được xóa vĩnh viễn cùng toàn bộ dữ liệu liên quan.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function bulkForceDelete(Request $request)
    {
        $ids = $request->input('product_ids', []);
        if (empty($ids) || !is_array($ids)) {
            return response()->json(['success' => false, 'message' => 'Vui lòng chọn ít nhất 1 sản phẩm để xóa.'], 400);
        }

        $successCount = 0;
        $failedProducts = [];

        foreach ($ids as $id) {
            DB::beginTransaction();
            try {
                $product = Product::withTrashed()->findOrFail($id);

                // Lấy danh sách biến thể
                $variants = $product->variants()->withTrashed()->get();
                $variantIds = $variants->pluck('id')->toArray();
                $safeVariantIds = empty($variantIds) ? [0] : $variantIds;

                // KIỂM TRA RÀNG BUỘC
                $isUsedInCombo = DB::table('combo_items')
                    ->where('product_id', $id)
                    ->orWhereIn('product_variant_id', $safeVariantIds)
                    ->exists();
                if ($isUsedInCombo) {
                    throw new \Exception("Sản phẩm đang nằm trong Combo khuyến mãi.");
                }

                $isUsedInOrder = DB::table('order_items')
                    ->where('product_id', $id)
                    ->orWhereIn('product_variant_id', $safeVariantIds)
                    ->exists();
                if ($isUsedInOrder) {
                    throw new \Exception("Sản phẩm đã phát sinh trong Đơn hàng.");
                }

                $isUsedInCart = false;
                if (!empty($variantIds)) {
                    $isUsedInCart = DB::table('cart_items')->whereIn('product_variant_id', $variantIds)->exists();
                }
                if ($isUsedInCart) {
                    throw new \Exception("Sản phẩm đang nằm trong Giỏ hàng của khách.");
                }

                // XÓA FILE ẢNH VẬT LÝ
                if ($product->thumbnail_image && Storage::disk('public')->exists($product->thumbnail_image)) {
                    // Không xóa ảnh placeholder mặc định
                    if (!str_contains($product->thumbnail_image, 'products/defaults/')) {
                        Storage::disk('public')->delete($product->thumbnail_image);
                    }
                }

                foreach ($variants as $variant) {
                    if ($variant->image_url && Storage::disk('public')->exists($variant->image_url)) {
                        Storage::disk('public')->delete($variant->image_url);
                    }
                }

                $productImages = DB::table('product_images')->where('product_id', $id)->get();
                foreach ($productImages as $pImg) {
                    if ($pImg->image_url && Storage::disk('public')->exists($pImg->image_url)) {
                        Storage::disk('public')->delete($pImg->image_url);
                    }
                }

                // XÓA DỮ LIỆU DATABASE (CASCADE)
                DB::table('product_images')->where('product_id', $id)->delete();
                
                if (!empty($variantIds)) {
                    DB::table('product_variant_attributes')->whereIn('variant_id', $variantIds)->delete();
                    ProductVariant::withTrashed()->where('product_id', $id)->forceDelete();
                }

                $product->forceDelete();

                DB::commit();
                $successCount++;
            } catch (\Exception $e) {
                DB::rollBack();
                $failedProducts[] = [
                    'id' => $id,
                    'name' => isset($product) ? $product->name : "ID: $id",
                    'reason' => $e->getMessage()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'success_count' => $successCount,
            'failed_products' => $failedProducts,
            'message' => 'Đã xử lý yêu cầu xóa hàng loạt.'
        ]);
    }
}