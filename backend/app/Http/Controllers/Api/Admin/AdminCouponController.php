<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Coupon\AdminStoreCouponRequest;
use App\Http\Requests\Admin\Coupon\AdminUpdateCouponRequest;
use Illuminate\Http\Request;
use App\Models\Coupon;

class AdminCouponController extends Controller
{
    /**
     * Lấy danh sách Coupon (Tối ưu trả về chuẩn format)
     */
    public function index()
    {
        // Tự động dọn dẹp các voucher hết hạn ngay khi Admin vừa mở danh sách (Lazy Cleanup)
        \App\Models\Coupon::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNull('user_id')
            ->update(['status' => 'inactive']);

        \App\Models\Coupon::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNotNull('user_id')
            ->delete();

        $coupons = Coupon::withTrashed()->orderBy('id', 'desc')->get();
        
        return response()->json([
            'success' => true, 
            'data' => $coupons
        ]);
    }

    /**
     * Tạo mới
     */
    public function store(AdminStoreCouponRequest $request)
    {
        try {
            $data = $request->validated();
            $coupon = Coupon::create($data);

            return response()->json([
                'success' => true,
                'message' => 'Tạo mã giảm giá thành công!',
                'data' => $coupon
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Chi tiết
     */
    public function show(string $id)
    {
        $coupon = Coupon::withTrashed()->findOrFail($id);
        return response()->json(['success' => true, 'data' => $coupon]);
    }

    /**
     * Cập nhật
     */
    public function update(AdminUpdateCouponRequest $request, string $id)
    {
        $coupon = Coupon::withTrashed()->findOrFail($id);

        try {
            // Hỗ trợ cập nhật nhanh duy nhất trạng thái (status)
            if ($request->has('status') && count($request->all()) == 1) {
                $coupon->update(['status' => $request->status]);
            } else {
                $data = $request->validated();
                $coupon->update($data);
            }

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật mã giảm giá thành công!',
                'data' => $coupon
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Xóa mềm
     */
    public function destroy(string $id)
    {
        $coupon = Coupon::findOrFail($id);

        try {
            $coupon->delete(); // Fixed bug: ->delete($coupon)

            return response()->json([
                'success' => true,
                'message' => 'Xoá mã giảm giá thành công!',
                'id' => $id
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Dọn dẹp mã giảm giá mồ côi (chỉ Super Admin)
     */
    public function cleanOrphanVouchers()
    {
        $admin = request()->user();
        if (!$admin || !$admin->role_id) {
            return response()->json(['success' => false, 'message' => 'Lỗi xác thực.'], 401);
        }
        $role = \Illuminate\Support\Facades\DB::table('roles')->where('id', $admin->role_id)->first();
        if (!$role || (int) $role->level !== 1) {
            return response()->json(['success' => false, 'message' => 'Truy cập bị từ chối: Chỉ Super Admin (Level 1) mới có quyền xóa vĩnh viễn.'], 403);
        }

        try {
            $deletedCount = \Illuminate\Support\Facades\DB::transaction(function () {
                $trashedCoupons = Coupon::onlyTrashed()->get();
                $count = 0;

                foreach ($trashedCoupons as $coupon) {
                    // Kiểm tra xem voucher đã từng được dùng trong đơn hàng nào chưa
                    $hasOrders = \Illuminate\Support\Facades\DB::table('orders')->where('coupon_id', $coupon->id)->exists();
                    
                    // Cẩn thận: Chỉ xóa những mã đã hết hạn HOẶC hết lượt. Các mã rác được xoá mềm thường rơi vào 2 nhóm này.
                    $isExpired = $coupon->expires_at !== null && now()->greaterThan($coupon->expires_at);
                    $isUsedUp = $coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit;
                    
                    if (!$hasOrders && ($isExpired || $isUsedUp)) {
                        $coupon->forceDelete();
                        $count++;
                    }
                }
                
                return $count;
            });

            return response()->json([
                'success' => true,
                'message' => "Đã dọn dẹp thành công {$deletedCount} mã giảm giá mồ côi."
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi khi dọn dẹp voucher: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Khôi phục từ thùng rác

     */
    public function restore(string $id)
    {
        $coupon = Coupon::withTrashed()->findOrFail($id);
        
        try {
            $coupon->restore();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã khôi phục mã giảm giá',
                'data' => $coupon
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}