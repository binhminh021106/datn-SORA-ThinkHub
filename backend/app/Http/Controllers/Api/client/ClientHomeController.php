<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use App\Models\Banner;
use App\Models\Coupon;
use App\Models\Combo;
use App\Models\MembershipTier;
use App\Models\CustomerGallery;
use App\Models\News;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class ClientHomeController extends Controller
{
    public function index()
    {
        try {
            // LẤY DỮ LIỆU TỪ CACHE (Hoặc truy vấn DB nếu chưa có Cache) - Tối ưu cực mạnh
            $data = Cache::remember('sora_home_data_v2', 3600, function () {
                $result = [
                    'banners' => [],
                    'coupons' => [],
                    'categories' => [],
                    'products' => [],
                    'combos' => [],
                    'tiers' => [],
                    'galleries' => [],
                    'news' => []
                ];

                // 1. Lấy Banners
                $result['banners'] = Banner::where('status', 'active')
                    ->orderBy('sort_order', 'asc')
                    ->get()->toArray();

                // 2. Lấy Coupons
                $result['coupons'] = Coupon::where('status', 'active')
                    ->whereNull('user_id') // SỬA LỖI Ở ĐÂY: Chỉ lấy các mã chung, không lấy mã sinh nhật cá nhân
                    ->where(function ($q) {
                        $q->whereNull('expires_at')
                            ->orWhere('expires_at', '>=', now());
                    })
                    ->get()->map(function ($coupon) {
                        return [
                            'id' => $coupon->id,
                            'code' => $coupon->code,
                            'discount_type' => $coupon->type == 'percentage' ? 'percent' : 'fixed',
                            'discount_value' => $coupon->value,
                            'min_order_value' => $coupon->min_spend ?? 0,
                        ];
                    })->toArray();

                // 3. Lấy Danh mục
                $result['categories'] = Category::where('status', 'active')
                    ->select('id', 'name', 'slug', 'thumbnail as image')
                    ->orderBy('sort_order', 'asc')
                    ->take(6)
                    ->get()->toArray();

                // 4. Lấy Sản phẩm
                $result['products'] = Product::where('status', 'published')
                    ->select('id', 'name', 'slug', 'thumbnail_image', 'base_price', 'promotional_price', 'created_at')
                    ->orderBy('is_featured', 'desc')
                    ->orderBy('id', 'desc')
                    ->take(8)
                    ->get()
                    ->map(function ($product) {
                        $arr = $product->toArray();
                        $arr['is_new'] = $product->created_at >= Carbon::now()->subDays(15);
                        return $arr;
                    })->toArray();

                // 5. Lấy Combos
                $yesterday = Carbon::now()->subDay();
                $combosList = Combo::with(['items.product' => function($q) {
                        $q->select('id', 'name', 'thumbnail_image', 'base_price', 'promotional_price');
                    }])
                    ->where('status', 'active')
                    ->where(function($q) use ($yesterday) {
                        $q->whereNull('end_date')
                          ->orWhere('end_date', '>=', $yesterday);
                    })
                    ->orderBy('id', 'desc')
                    ->take(5)
                    ->get();

                $result['combos'] = $combosList->map(function ($combo) {
                    $totalBasePrice = 0;
                    $productsArray = [];

                    foreach ($combo->items as $item) {
                        if ($item->product) {
                            $priceToUse = $item->product->promotional_price > 0 ? $item->product->promotional_price : $item->product->base_price;
                            $totalBasePrice += ($priceToUse * $item->quantity);
                            $productsArray[] = [
                                'id' => $item->product->id,
                                'name' => $item->product->name,
                                'thumbnail_image' => $item->product->thumbnail_image
                            ];
                        }
                    }

                    $comboPromoPrice = $totalBasePrice;
                    if ($combo->discount_value > 0) {
                        if ($combo->discount_type === 'percentage' || $combo->discount_type === 'percent') {
                            $comboPromoPrice = $totalBasePrice - ($totalBasePrice * ($combo->discount_value / 100));
                        } else {
                            $comboPromoPrice = $totalBasePrice - $combo->discount_value;
                        }
                    }

                    return [
                        'id' => $combo->id,
                        'slug' => $combo->slug,
                        'name' => $combo->name,
                        'description' => $combo->description,
                        'thumbnail_image' => $combo->thumbnail_image,
                        'base_price' => $totalBasePrice,
                        'promotional_price' => $comboPromoPrice > 0 ? $comboPromoPrice : 0,
                        'products' => $productsArray
                    ];
                })->toArray();

                // 6. Lấy Hạng hội viên
                $result['tiers'] = MembershipTier::where('min_spent', '>', 0)
                    ->orderBy('min_spent', 'asc')
                    ->take(3)
                    ->get()->toArray();

                // 7. LẤY CHÂN DUNG SORA
                try {
                    $result['galleries'] = CustomerGallery::where('is_active', 1)
                        ->orderBy('sort_order', 'asc')
                        ->orderBy('created_at', 'desc')
                        ->get(['image_path'])->toArray();
                } catch (\Exception $e) {
                    $result['galleries'] = []; 
                }

                // 8. Lấy tin tức
                try {
                    $result['news'] = News::where('status', 'published')
                        ->orderBy('created_at', 'desc')
                        ->take(3)
                        ->get(['id', 'title', 'slug', 'excerpt', 'content', 'image_url', 'category'])->toArray();
                } catch (\Exception $e) {
                    $result['news'] = [];
                }

                return $result;
            });

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Cảnh báo Backend: ' . $e->getMessage()
            ], 500);
        }
    }

    public function goldPrices()
    {
        try {
            $goldPrices = Cache::get('sora_gold_prices', []);
            $lastUpdated = Cache::get('sora_gold_last_updated', '');

            return response()->json([
                'success' => true,
                'data' => [
                    'prices' => $goldPrices,
                    'last_updated' => $lastUpdated
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi tải giá vàng: ' . $e->getMessage()
            ], 500);
        }
    }
}