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

            do {
                $code = 'SORA-' . strtoupper(Str::random(6));
            } while (\App\Models\User::where('affiliate_code', $code)->exists());

            $user->affiliate_code = $code;
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

    // Vô hiệu hóa tư cách affiliate và mã giới thiệu của khách hàng
    public function revoke($id)
    {
        \Illuminate\Support\Facades\DB::beginTransaction();

        try {
            $application = AffiliateApplication::with('user')->findOrFail($id);

            if ($application->status !== 'approved') {
                \Illuminate\Support\Facades\DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Chỉ có thể vô hiệu hóa đơn affiliate đã được duyệt.',
                ], 400);
            }

            $user = $application->user;
            if (!$user) {
                \Illuminate\Support\Facades\DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy khách hàng của đơn affiliate này.',
                ], 404);
            }

            $application->update([
                'status' => 'revoked',
                'admin_notes' => 'Admin đã vô hiệu hóa tư cách affiliate.',
            ]);

            $user->is_affiliate = false;
            $user->affiliate_code = null;
            $user->save();

            \Illuminate\Support\Facades\DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đã vô hiệu hóa mã affiliate của khách hàng.',
                'data' => $application->fresh('user'),
            ], 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // quản lý hoa hồng của các đối tác
    // 1. Lấy danh sách tất cả yêu cầu rút tiền
    public function withdrawals()
    {
        $withdrawals = \App\Models\CommissionHistory::with('user:id,fullName,email,phone')
            ->where('type', 'withdraw')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $withdrawals
        ]);
    }

    // 2. Admin/Kế toán duyệt lệnh rút tiền (Đã chuyển khoản)
    public function approveWithdrawal($id)
    {
        $withdrawal = \App\Models\CommissionHistory::find($id);
        
        if (!$withdrawal || $withdrawal->type !== 'withdraw') {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy yêu cầu rút tiền này!'], 404);
        }
        
        if ($withdrawal->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Yêu cầu này đã được xử lý trước đó!'], 400);
        }

        $withdrawal->status = 'approved';
        $withdrawal->save();

        return response()->json(['success' => true, 'message' => 'Đã duyệt yêu cầu rút tiền thành công!']);
    }

    // 3. Admin/Kế toán từ chối lệnh rút tiền (Sai STK, Lỗi ngân hàng...) -> Hoàn tiền lại cho user
    public function rejectWithdrawal(Request $request, $id)
    {
        $withdrawal = \App\Models\CommissionHistory::find($id);
        
        if (!$withdrawal || $withdrawal->type !== 'withdraw') {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy yêu cầu rút tiền này!'], 404);
        }
        
        if ($withdrawal->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Yêu cầu này đã được xử lý trước đó!'], 400);
        }

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $withdrawal->status = 'rejected';
            $reason = $request->input('admin_notes', 'Thông tin ngân hàng không hợp lệ.');
            $withdrawal->description .= " | Từ chối: " . $reason;
            $withdrawal->save();

            $user = \App\Models\User::find($withdrawal->user_id);
            if (!$user) {
                \Illuminate\Support\Facades\DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Không tìm thấy người dùng để hoàn tiền!'], 404);
            }

            $user->commission_balance += $withdrawal->amount;
            $user->save();

            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['success' => true, 'message' => 'Đã từ chối lệnh rút và hoàn tiền lại vào ví cho đối tác!']);
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi xử lý hệ thống: ' . $e->getMessage()], 500);
        }
    }
}
