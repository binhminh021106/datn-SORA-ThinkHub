<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AttributeValue;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminAttributeValueController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'attribute_id' => 'required|exists:attributes,id',
            'value' => 'required|string|max:255'
        ]);

        $val = AttributeValue::firstOrCreate([
            'attribute_id' => $request->attribute_id,
            'value' => $request->value
        ]);

        return response()->json(['success' => true, 'data' => $val]);
    }

    public function destroy($id)
    {
        $val = AttributeValue::findOrFail($id);

        try {
            DB::transaction(function () use ($id, $val) {
                // Kiểm tra xem giá trị này có đang được sử dụng ở bất kỳ biến thể sản phẩm nào không
                $isUsed = \Illuminate\Support\Facades\DB::table('product_variant_attributes')
                    ->where('attribute_value_id', $id)
                    ->exists();

                if ($isUsed) {
                    throw new \DomainException('Không thể xóa giá trị này vì đang được sử dụng ở một hoặc nhiều biến thể sản phẩm.');
                }

                $val->delete();
            });

            return response()->json(['success' => true, 'message' => 'Đã xóa giá trị thuộc tính.']);
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 422);
        }
    }
}