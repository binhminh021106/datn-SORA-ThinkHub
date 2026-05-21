<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use App\Models\Combo;
use App\Http\Requests\AdminUpdateReviewRequest;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    /**
     * Lấy danh sách đánh giá có phân trang và lọc
     */
    public function index(Request $request)
    {
        try {
            $query = Review::with([
                'user:id,fullName,email,avatar_url', 
                'product:id,name,slug,thumbnail_image', 
                'combo:id,name,slug,thumbnail_image'
            ]);

            if ($request->filled('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->filled('rating')) {
                $query->where('rating', $request->rating);
            }

            $reviews = $query->orderBy('created_at', 'desc')->paginate(15);

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi truy xuất dữ liệu: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xem chi tiết 1 đánh giá
     */
    public function show($id)
    {
        try {
            $review = Review::with([
                'user:id,fullName,email,phone,avatar_url', 
                'product:id,name,slug,thumbnail_image', 
                'combo:id,name,slug,thumbnail_image', 
                'order:id,order_code,total_amount,created_at'
            ])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đánh giá.'
            ], 404);
        }
    }

    /**
     * Cập nhật trạng thái và phản hồi đánh giá
     */
    public function update(AdminUpdateReviewRequest $request, $id)
    {
        try {
            $review = Review::findOrFail($id);
            
            $review->update($request->validated());
            
            $this->syncRatingStats($review);

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật đánh giá thành công',
                'data' => $review
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi cập nhật: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Xóa vĩnh viễn đánh giá
     */
    public function destroy($id)
    {
        try {
            $review = Review::findOrFail($id);
            
            $review->delete();
            
            $this->syncRatingStats($review);

            return response()->json([
                'success' => true,
                'message' => 'Đã xóa đánh giá vĩnh viễn'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi xóa đánh giá: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Đồng bộ lại số sao trung bình của sản phẩm/combo
     */
    private function syncRatingStats(Review $review)
    {
        if ($review->product_id) {
            $product = Product::find($review->product_id);
            if ($product) {
                $stats = Review::where('product_id', $product->id)
                    ->where('status', 'approved');
                    
                $product->update([
                    'rating_avg' => $stats->avg('rating') ?? 0,
                    'review_count' => $stats->count()
                ]);
            }
        } elseif ($review->combo_id) {
            $combo = Combo::find($review->combo_id);
            if ($combo) {
                $stats = Review::where('combo_id', $combo->id)
                    ->where('status', 'approved');
                    
                $combo->update([
                    'rating_avg' => $stats->avg('rating') ?? 0,
                    'review_count' => $stats->count()
                ]);
            }
        }
    }
}