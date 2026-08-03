<?php

namespace App\Http\Controllers\Api\Client;

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
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
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
                    'rating_avg' => (float) ($product->reviews_avg_rating ?? $product->rating_avg ?? 0),
                    'review_count' => (int) ($product->reviews_count ?? $product->review_count ?? 0),
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
            
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy sản phẩm hoặc có lỗi xảy ra'
            ], 404);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.'
            ], 500);
        }
    }

    /**
     * Return only the data needed by the Quick Add modal.
     */
    public function quickAdd($shop_slug, $slug)
    {
        try {
            $product = Product::query()
                ->select(['id', 'category_id', 'name', 'slug', 'base_price', 'promotional_price', 'thumbnail_image'])
                ->with([
                    'category:id,name',
                    'variants' => function ($query) {
                        $query->select([
                            'id',
                            'product_id',
                            'sku',
                            'price',
                            'promotional_price',
                            'stock_quantity',
                            'image_url',
                        ])
                            ->whereNull('deleted_at')
                            ->with([
                                'attributeValues:id,attribute_id,value',
                                'attributeValues.attribute:id,name',
                            ]);
                    },
                ])
                ->where('slug', $slug)
                ->where('status', 'published')
                ->firstOrFail();

            $groupedAttributes = [];
            $variants = [];

            foreach ($product->variants as $variant) {
                $attributeIds = [];

                foreach ($variant->attributeValues as $attributeValue) {
                    $attributeName = mb_strtoupper($attributeValue->attribute->name ?? 'PHAN LOAI');

                    if (! isset($groupedAttributes[$attributeName])) {
                        $groupedAttributes[$attributeName] = [];
                    }

                    if (! collect($groupedAttributes[$attributeName])->contains('id', $attributeValue->id)) {
                        $groupedAttributes[$attributeName][] = [
                            'id' => $attributeValue->id,
                            'name' => $attributeValue->value,
                            'colorCode' => null,
                        ];
                    }

                    $attributeIds[$attributeName] = $attributeValue->id;
                }

                $variants[] = [
                    'id' => $variant->id,
                    'sku' => $variant->sku,
                    'price' => (float) $variant->price,
                    'promotional_price' => $variant->promotional_price ? (float) $variant->promotional_price : null,
                    'stock' => (int) $variant->stock_quantity,
                    'image' => $variant->image_url
                        ? asset('storage/' . $variant->image_url)
                        : asset('storage/' . $product->thumbnail_image),
                    'attributes' => $attributeIds,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $product->id,
                    'name' => $product->name,
                    'category' => $product->category,
                    'base_price' => (float) $product->base_price,
                    'promotional_price' => $product->promotional_price ? (float) $product->promotional_price : null,
                    'thumbnail_image' => $product->thumbnail_image,
                    'attributes' => $groupedAttributes,
                    'variants' => $variants,
                ],
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $exception) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay san pham hoac san pham khong con kha dung.',
            ], 404);
        } catch (\Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Khong the tai tuy chon san pham. Vui long thu lai sau.',
            ], 500);
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
