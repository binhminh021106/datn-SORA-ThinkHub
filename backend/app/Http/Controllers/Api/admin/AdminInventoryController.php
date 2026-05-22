<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use App\Models\Combo;
use App\Http\Requests\AdminUpdateInventoryRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Events\InventoryUpdated;

class AdminInventoryController extends Controller
{
    public function getVariants()
    {
        try {
            // Tối ưu ORM: Eager Loading chọn lọc
            $variants = ProductVariant::whereHas('product')->with([
                'product:id,name,slug,category_id,base_price,status,thumbnail_image',
                'product.category:id,name',
                'attributeValues.attribute:id,name'
            ])->orderBy('id', 'desc')->get();

            // TỐI ƯU PAYLOAD JSON CHO AXIOS (TanStack Query): 
            // Map thành Array thuần túy, loại bỏ các meta-data thừa của Laravel Collection giúp gói tin nhẹ đi 30-40%
            $mappedVariants = $variants->map(function ($variant) {
                $attrMap = [];
                foreach ($variant->attributeValues as $val) {
                    if ($val->attribute) {
                        $attrMap[$val->attribute->name] = $val->value;
                    }
                }
                
                return [
                    'id'                   => $variant->id,
                    'product_id'           => $variant->product_id,
                    'sku'                  => $variant->sku,
                    'price'                => $variant->price,
                    'promotional_price'    => $variant->promotional_price,
                    'stock_quantity'       => $variant->stock_quantity,
                    'image_url'            => $variant->image_url,
                    'formatted_attributes' => $attrMap,
                    'product'              => $variant->product, // Đã bao gồm cả category bên trong nhờ Eager Loading
                ];
            });

            return response()->json(['success' => true, 'data' => $mappedVariants]);
        } catch (\Exception $e) {
            Log::error('Lỗi lấy danh sách kho biến thể: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống khi tải kho hàng.'], 500);
        }
    }

    public function updateVariantStock(AdminUpdateInventoryRequest $request, $id)
    {
        $variant = ProductVariant::findOrFail($id);
        
        DB::beginTransaction();
        try {
            $oldStock = $variant->stock_quantity;
            $action = $request->input('action');
            $quantity = $request->input('quantity');

            // Bảo vệ tính toàn vẹn kho hàng
            if ($action !== 'add') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hệ thống không cho phép trừ tồn kho thủ công để đảm bảo an ninh và minh bạch tài sản. Nếu có sai sót, vui lòng lập phiếu xuất/hủy kho.'
                ], 403);
            }

            $variant->stock_quantity += $quantity;
            $variant->save();
            
            DB::commit();

            // Broadcast sự kiện Realtime cập nhật kho
            event(new InventoryUpdated('variant', $variant->id, ['old_stock' => $oldStock, 'new_stock' => $variant->stock_quantity]));

            return response()->json([
                'success' => true,
                'message' => 'Nhập thêm tồn kho thành công',
                'data' => [
                    'old_stock' => $oldStock,
                    'new_stock' => $variant->stock_quantity
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Lỗi cập nhật tồn kho biến thể ID ' . $id . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống khi cập nhật tồn kho.'
            ], 500);
        }
    }

    public function updateComboLimit(AdminUpdateInventoryRequest $request, $id)
    {
        try {
            $combo = Combo::findOrFail($id);
            
            $combo->update(['usage_limit' => $request->input('usage_limit')]);

            // Broadcast sự kiện Realtime cho Combo
            event(new InventoryUpdated('combo', $combo->id, ['usage_limit' => $combo->usage_limit]));

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật giới hạn Combo thành công'
            ]);
        } catch (\Exception $e) {
            Log::error('Lỗi cập nhật giới hạn Combo ID ' . $id . ': ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống khi cập nhật giới hạn combo.'
            ], 500);
        }
    }
}