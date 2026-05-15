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
        $variants = ProductVariant::whereHas('product')->with([
            'product:id,name,slug,category_id,base_price,status,thumbnail_image',
            'product.category:id,name',
            'attributeValues.attribute:id,name'
        ])->orderBy('id', 'desc')->get();

        $variants->transform(function ($variant) {
            $attrMap = [];
            foreach ($variant->attributeValues as $val) {
                if ($val->attribute) {
                    $attrMap[$val->attribute->name] = $val->value;
                }
            }
            $variant->formatted_attributes = $attrMap;
            unset($variant->attributeValues);
            return $variant;
        });

        return response()->json(['success' => true, 'data' => $variants]);
    }

    public function updateVariantStock(AdminUpdateInventoryRequest $request, $id)
    {
        $variant = ProductVariant::findOrFail($id);
        
        DB::beginTransaction();
        try {
            $oldStock = $variant->stock_quantity;
            $action = $request->input('action');
            $quantity = $request->input('quantity');
            $note = $request->input('note');

            if ($action !== 'add') {
                return response()->json([
                    'success' => false,
                    'message' => 'Hệ thống không cho phép trừ tồn kho thủ công để đảm bảo an ninh và minh bạch tài sản. Nếu có sai sót, vui lòng lập phiếu xuất/hủy kho.'
                ], 403);
            }

            $variant->stock_quantity += $quantity;

            $variant->save();
            DB::commit();

            // Broadcast inventory update
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
            Log::error('Lỗi cập nhật tồn kho: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Đã xảy ra lỗi hệ thống khi cập nhật tồn kho.'
            ], 500);
        }
    }

    public function updateComboLimit(AdminUpdateInventoryRequest $request, $id)
    {
        $combo = Combo::findOrFail($id);
        
        $combo->update(['usage_limit' => $request->input('usage_limit')]);

        // Broadcast inventory update for combo limit
        event(new InventoryUpdated('combo', $combo->id, ['usage_limit' => $combo->usage_limit]));

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật giới hạn Combo thành công'
        ]);
    }
}