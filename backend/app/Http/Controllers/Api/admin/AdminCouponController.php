<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminStoreCouponRequest;
use App\Http\Requests\AdminUpdateCouponRequest;
use Illuminate\Http\Request;
use App\Models\Coupon;

class AdminCouponController extends Controller
{
    /**
     * Lấy danh sách Coupon (Tối ưu trả về chuẩn format)
     */
    public function index()
    {
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