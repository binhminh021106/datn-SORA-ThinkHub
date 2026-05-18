<?php

namespace App\Http\Controllers\Api\client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductDetailController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Hiển thị chi tiết sản phẩm dựa trên Slug
     */
    public function show($shop_slug, $slug)
    {
        try {
            // 1. Query lấy sản phẩm
            // Load các relationship: brand, category (Đã bổ sung slug để tìm sp liên quan) và toàn bộ thông tin attribute
            $product = Product::with([
                'brand:id,name',
                'category:id,name,slug', // THÊM SLUG Ở ĐÂY
                'variants' => function($q) {
                    $q->whereNull('deleted_at'); 
                },
                'variants.attributeValues.attribute'
            ])
            ->where('slug', $slug)
            ->where('status', 'published') 
            ->firstOrFail();

            // 2. Xử lý logic Hình ảnh (Gallery)
            // Lấy ảnh thumbnail làm ảnh đầu tiên
            $images = collect([$product->thumbnail_image]);
            foreach ($product->variants as $variant) {
                if ($variant->image_url && !$images->contains($variant->image_url)) {
                    $images->push($variant->image_url);
                }
            }
            
            // Format URL ảnh
            $formattedImages = $images->map(function ($img) {
                return asset('storage/' . $img); 
            })->values();

            // 3. Xử lý logic Thuộc tính & Biến thể một cách động
            $groupedAttributes = [];
            $mappedVariants = [];

            foreach ($product->variants as $variant) {
                $variantAttributesMap = []; 

                foreach ($variant->attributeValues as $attrValue) {
                    $attributeName = mb_strtoupper($attrValue->attribute->name ?? 'PHÂN LOẠI');

                    if (!isset($groupedAttributes[$attributeName])) {
                        $groupedAttributes[$attributeName] = [];
                    }

                    $exists = collect($groupedAttributes[$attributeName])->contains('id', $attrValue->id);
                    if (!$exists) {
                        $groupedAttributes[$attributeName][] = [
                            'id' => $attrValue->id,
                            'name' => $attrValue->value,
                            'colorCode' => $attrValue->color_code ?? null,
                        ];
                    }

                    $variantAttributesMap[$attributeName] = $attrValue->id;
                }

                $mappedVariants[] = [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
                    'price' => (float) $variant->price,
                    'promotional_price' => $variant->promotional_price ? (float) $variant->promotional_price : null,
                    'stock' => (int) $variant->stock_quantity,
                    'image' => $variant->image_url ? asset('storage/' . $variant->image_url) : asset('storage/' . $product->thumbnail_image),
                    'attributes' => $variantAttributesMap, 
                ];
            }

            // 4. Trả về JSON Response
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category, // Trả về category để frontend lấy slug
                    'brand' => $product->brand,
                    'rating_avg' => (float) $product->rating_avg ?: 5.0, 
                    'review_count' => (int) $product->review_count,
                    'sold_count' => 1500, 
                    'description' => $product->description,
                    'specifications' => is_array($product->specifications) ? $product->specifications : json_decode($product->specifications, true),
                    'attributes' => $groupedAttributes, 
                    'variants' => $mappedVariants,
                    'images' => $formattedImages,
                    // FIX: Giới hạn số lượng review lấy ra (VD: 10) để tránh treo RAM nếu sản phẩm có hàng ngàn đánh giá
                    'reviews' => \App\Models\Review::with('user:id,fullName,avatar_url')->where('product_id', $product->id)->orderBy('created_at', 'desc')->take(10)->get()->map(function($review) {
                        if ($review->images) {
                            $review->images = array_map(function($img) {
                                return asset('storage/' . $img);
                            }, $review->images);
                        }
                        return $review;
                    })
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm hoặc có lỗi xảy ra',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}