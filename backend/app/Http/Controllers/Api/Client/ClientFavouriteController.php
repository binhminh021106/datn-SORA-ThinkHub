<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Favourite;
use Illuminate\Support\Facades\Auth;

class ClientFavouriteController extends Controller
{
    /**
     * Lấy danh sách sản phẩm yêu thích của user đang đăng nhập
     */
    public function index(Request $request)
    {
        // FIX: Dùng guard sanctum để bắt token ở mọi trường hợp
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng đăng nhập để xem danh sách yêu thích'
            ], 401);
        }

        // Lấy danh sách yêu thích kèm chi tiết sản phẩm (Lấy các trường cần thiết theo Product Model)
        $favourites = Favourite::whereHas('product', function($query) {
                $query->where('status', 'published');
            })
            ->with(['product' => function($query) {
                $query->select('id', 'name', 'slug', 'base_price', 'promotional_price', 'thumbnail_image', 'review_count', 'rating_avg', 'status')
                    ->withCount('reviews')
                    ->withAvg('reviews', 'rating');
            }])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'message' => 'Lấy danh sách yêu thích thành công',
            'data' => $favourites
        ]);
    }

    /**
     * Thả tim hoặc Hủy thả tim sản phẩm (Toggle)
     */
    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id'
        ]);

        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'status' => false,
                'message' => 'Vui lòng đăng nhập để thực hiện chức năng này'
            ], 401);
        }

        $productId = $request->product_id;

        // Tìm xem user đã tim sản phẩm này chưa
        $favourite = Favourite::where('user_id', $user->id)
                              ->where('product_id', $productId)
                              ->first();

        if ($favourite) {
            $favourite->delete(); // Hủy tim
            return response()->json([
                'status' => true,
                'action' => 'removed',
                'message' => 'Đã xóa sản phẩm khỏi danh sách yêu thích'
            ]);
        } else {
            // Chỉ cho phép thêm nếu sản phẩm tồn tại và đang được bán
            $product = \App\Models\Product::find($productId);
            if (!$product || $product->status !== 'published') {
                return response()->json([
                    'status' => false,
                    'message' => 'Sản phẩm không tồn tại hoặc ngừng kinh doanh'
                ], 403);
            }

            Favourite::create([   // Thả tim
                'user_id' => $user->id,
                'product_id' => $productId
            ]);
            return response()->json([
                'status' => true,
                'action' => 'added',
                'message' => 'Đã thêm sản phẩm vào danh sách yêu thích'
            ]);
        }
    }

    /**
     * Kiểm tra trạng thái tim của 1 sản phẩm 
     */
    public function check($productId)
    {
        $user = Auth::guard('sanctum')->user();
        
        if (!$user) {
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
