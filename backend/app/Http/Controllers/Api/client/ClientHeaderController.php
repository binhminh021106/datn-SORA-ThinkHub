<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Models\Product;
use App\Models\Cart;

class ClientHeaderController extends Controller
{
    public function getMegaMenuData(Request $request)
    {
        try {
            $categories = Category::whereNull('parent_id')
                ->where('status', 'active')
                ->orderBy('sort_order', 'asc')
                ->select('id', 'name', 'slug')
                ->get();

            // FIX: Tối ưu N+1 query - Lấy tất cả top products của các category cùng lúc
            $categoryIds = $categories->pluck('id');
            $allTopProducts = Product::whereIn('category_id', $categoryIds)
                ->where('status', 'published')
                ->orderBy('is_featured', 'desc')
                ->orderBy('id', 'desc')
                ->select('id', 'name', 'slug', 'thumbnail_image', 'base_price', 'promotional_price', 'category_id')
                ->get()
                ->groupBy('category_id');

            $categories->map(function ($category) use ($allTopProducts) {
                $category->top_products = $allTopProducts->get($category->id, collect())->take(4)->values();
                return $category;
            });

            // Lấy Số lượng mặt hàng trong Giỏ (Không phải tổng Quantity)
            $cartCount = 0;
            $user = auth('sanctum')->user();
            $sessionId = $request->header('X-Cart-Session-Id');

            if ($user || $sessionId) {
                $cartQuery = Cart::withCount('items');
                if ($user) {
                    $cart = $cartQuery->where('user_id', $user->id)->first();
                } else {
                    $cart = $cartQuery->where('session_id', $sessionId)->first();
                }

                if ($cart) {
                    $cartCount = $cart->items_count;
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'categories' => $categories,
                    'cart_count' => $cartCount,
                    'config' => [
                        'phone' => '12345678910',
                        'email' => 'SORA@GMAIL.COM',
                        'facebook' => '#',
                        'instagram' => '#',
                        'twitter' => '#'
                    ]
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function search(Request $request)
    {
        $keyword = $request->query('keyword');

        if (!$keyword) {
            return response()->json(['success' => true, 'data' => ['products' => [], 'categories' => []]]);
        }

        $categories = Category::where('name', 'LIKE', "%{$keyword}%")
            ->where('status', 'active')
            ->select('id', 'name', 'slug')
            ->take(3)
            ->get();

        $productsQuery = Product::where('name', 'LIKE', "%{$keyword}%")
            ->where('status', 'published');

        if ($productsQuery->count() === 0 && $categories->count() > 0) {
            $products = Product::where('category_id', $categories->first()->id)
                ->where('status', 'published')
                ->take(5)
                ->select('id', 'name', 'slug', 'thumbnail_image', 'base_price', 'promotional_price')
                ->get();
            $isFallback = true;
        } else {
            $products = $productsQuery->take(5)
                ->select('id', 'name', 'slug', 'thumbnail_image', 'base_price', 'promotional_price')
                ->get();
            $isFallback = false;
        }

        return response()->json([
            'success' => true,
            'data' => [
                'categories' => $categories,
                'products' => $products,
                'is_category_fallback' => $isFallback
            ]
        ]);
    }
}