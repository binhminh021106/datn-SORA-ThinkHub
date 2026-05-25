<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\AffiliateApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminAffiliateController extends Controller
{
    // lấy danh sách đơn đăng ký làm affiliate
    public function index()
    {
        try {
            $applications = AffiliateApplication::with('user:id,fullName,email,phone')
                ->orderBy('id', 'desc')
                ->get();
                
            return response()->json([
                'success' => true, 
                'data' => $applications
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // phê duyệt đơn đăng ký
    public function approve($id)
    {
        try {
            $application = AffiliateApplication::findOrFail($id);
            
            if ($application->status === 'approved') {
                return response()->json(['success' => false, 'message' => 'Đơn này đã được duyệt rồi!'], 400);
            }

            $application->update(['status' => 'approved']);

            // Kích hoạt User thành Affiliate và tạo mã
            $user = $application->user;
            $user->is_affiliate = true;
            $user->affiliate_code = 'SORA-' . strtoupper(Str::random(6));
            $user->save();

            return response()->json([
                'success' => true, 
                'message' => 'Đã duyệt đơn và cấp mã ' . $user->affiliate_code . ' cho khách hàng!',
                'data' => $application
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // Từ chối đơn đăng ký
    public function reject(Request $request, $id)
    {
        try {
            $application = AffiliateApplication::findOrFail($id);
            
            $application->update([
                'status' => 'rejected',
                'admin_notes' => $request->admin_notes
            ]);

            return response()->json([
                'success' => true, 
                'message' => 'Đã từ chối đơn đăng ký.',
                'data' => $application
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}