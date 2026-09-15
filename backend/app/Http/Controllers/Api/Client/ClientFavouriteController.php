<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Favourite;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClientFavouriteController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (! $user instanceof User) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng đăng nhập để xem danh sách yêu thích',
                'require_login' => true
            ], 200); 
        }

        $favourites = Favourite::whereHas('product', function($query) {
                $query->where('status', 'published');
            })
            ->with(['product' => function($query) {
                $query->select('id', 'name', 'slug', 'base_price', 'promotional_price', 'thumbnail_image', 'review_count', 'rating_avg', 'status')
                    ->withCount('reviews')
                    ->withAvg('reviews', 'rating')
                    ->with('variants:id,product_id,stock_quantity,price,promotional_price,sku,image_url');
            }])
            ->where('user_id', $user->id)
            ->limit(200)
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách yêu thích thành công',
            'data' => $favourites
        ]);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id'
        ]);

        $user = Auth::guard('sanctum')->user();
        
        if (! $user instanceof User) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng đăng nhập để thực hiện chức năng này',
                'require_login' => true
            ], 200); 
        }

        $productId = $request->product_id;
        return DB::transaction(function () use ($user, $productId) {

            User::query()->whereKey($user->id)->lockForUpdate()->first();


            $product = Product::query()->whereKey($productId)->lockForUpdate()->first();
            $favourite = Favourite::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->lockForUpdate()
                ->first();

            if ($favourite) {
                $favourite->delete(); 
                return response()->json([
                    'status' => true,
                    'action' => 'removed',
                    'message' => 'Đã xóa sản phẩm khỏi danh sách yêu thích'
                ]);
            }

            if (!$product || $product->status !== 'published') {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại hoặc ngừng kinh doanh'
                ], 403);
            }

            if (Favourite::where('user_id', $user->id)->count() >= 200) {
                return response()->json([
                    'status' => false,
                    'message' => 'Bạn chỉ có thể lưu tối đa 200 sản phẩm yêu thích.'
                ], 422);
            }

            Favourite::create([  
                'user_id' => $user->id,
                'product_id' => $productId
            ]);
            return response()->json([
                'status' => true,
                'action' => 'added',
                'message' => 'Đã thêm sản phẩm vào danh sách yêu thích'
            ]);
        });
    }

    public function check($productId)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (! $user instanceof User) {
            return response()->json(['is_favourited' => false]);
        }

        $exists = Favourite::where('user_id', $user->id)
                           ->where('product_id', $productId)
                           ->whereHas('product', fn($q) => $q->where('status', 'published'))
                           ->exists();

        return response()->json([
            'is_favourited' => $exists
        ]);
    }
}
