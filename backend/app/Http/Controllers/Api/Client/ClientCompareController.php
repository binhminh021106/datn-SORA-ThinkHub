<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ClientCompareController extends Controller
{
    /**
     * Nhận mảng các ID sản phẩm và trả về thông tin chi tiết để so sánh
     */
    public function getCompareData(Request $request, $shop_slug)
    {
        $data = $request->validate([
            'product_ids' => ['nullable', 'array', 'max:3'],
            'product_ids.*' => ['integer', 'distinct', 'exists:products,id'],
        ]);
        $productIds = $data['product_ids'] ?? [];

        if (empty($productIds)) {
            return response()->json([
                'success' => true,
                'data' => []
            ]);
        }

        try {
            $products = Product::with([
                'brand:id,name',
                'category:id,name',
                'variants' => function($q) {
                    $q->select('product_id', 'stock_quantity');
                }
            ])
            ->whereIn('id', $productIds)
            ->where('status', 'published')
            ->get();

            $sortedProducts = collect($productIds)->map(function ($id) use ($products) {
                return $products->firstWhere('id', $id);
            })->filter()->values();

            $formattedData = $sortedProducts->map(function ($product) {
                
                $totalStock = $product->variants ? $product->variants->sum('stock_quantity') : 0;

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'thumbnail_image' => $product->thumbnail_image ? asset('storage/' . $product->thumbnail_image) : null,
                    'base_price' => (float) $product->base_price,
                    'promotional_price' => $product->promotional_price ? (float) $product->promotional_price : null,
                    'brand_name' => $product->brand ? $product->brand->name : 'Không có',
                    'category_name' => $product->category ? $product->category->name : 'Không có',
                    
                    'stock_quantity' => $totalStock, 

                    'description' => $product->description,
                    'specifications' => is_string($product->specifications) ? json_decode($product->specifications, true) : $product->specifications,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedData
            ]);

        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi lấy dữ liệu so sánh'
            ], 500);
        }
    }
}
