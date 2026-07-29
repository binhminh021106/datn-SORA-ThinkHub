<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\AffiliateApplication;
use App\Models\CommissionHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ClientAffiliateController extends Controller
{
    // lấy status affiliate của user hiện tại
    public function status()
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();
            $application = AffiliateApplication::where('user_id', $user->id)->first();

            $data = [
                'is_affiliate'       => $user->is_affiliate,
                'affiliate_code'     => $user->affiliate_code,
                'commission_balance' => (float) $user->commission_balance,
                'application'        => $application,
                'dashboard_stats'    => null,
                'histories'          => []
            ];

            if ($user->is_affiliate) {
                // 1. Tiền chờ duyệt (Đơn đang giao dịch)
                $pendingBalance = CommissionHistory::where('user_id', $user->id)
                    ->where('type', 'earn')
                    ->where('status', 'pending')
                    ->sum('amount');

                // 2. Tổng tiền đã rút (Lệnh rút thành công)
                $totalWithdrawn = CommissionHistory::where('user_id', $user->id)
                    ->where('type', 'withdraw')
                    ->whereIn('status', ['approved', 'withdrawn'])
                    ->sum('amount');

                $data['dashboard_stats'] = [
                    'available_balance' => (float) $user->commission_balance,
                    'pending_balance'   => (float) $pendingBalance,
                    'total_withdrawn'   => (float) $totalWithdrawn
                ];

                // 3. Lịch sử biến động số dư (20 giao dịch gần nhất)
                $data['histories'] = CommissionHistory::with('order:id,order_code')
                    ->where('user_id', $user->id)
                    ->orderBy('created_at', 'desc')
                    ->take(20)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id'             => $item->id,
                            'created_at'     => \Carbon\Carbon::parse($item->created_at)->format('Y-m-d H:i'),
                            'reference_code' => $item->type === 'earn' 
                                                ? ($item->order->order_code ?? 'Đơn hàng ẩn') 
                                                : 'WITHDRAW-' . str_pad($item->id, 5, '0', STR_PAD_LEFT),
                            'type'           => $item->type,
                            'amount'         => (float) $item->amount,
                            'status'         => $item->status,
                        ];
                    });
            }

            return response()->json([
                'success' => true,
                'data'    => $data
            ], 200);

        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Không thể tải thông tin đối tác lúc này. Vui lòng thử lại sau.'], 500);
        }
    }

    // gửi đơn đăng ký làm affiliate
    public function apply(Request $request)
    {
        try {
            /** @var \App\Models\User $user */
            $user = Auth::user();

            $existingApp = AffiliateApplication::where('user_id', $user->id)->first();
            if ($existingApp && in_array($existingApp->status, ['pending', 'approved'])) {
                return response()->json(['success' => false, 'message' => 'Bạn đã nộp đơn đăng ký rồi!'], 400);
            }

            $request->validate([
                'social_links'      => 'required|string',
                'introduce_message' => 'required|string|max:1000'
            ]);

            if ($existingApp && $existingApp->status === 'rejected') {
                $existingApp->update([
                    'social_links'      => $request->social_links,
                    'introduce_message' => $request->introduce_message,
                    'status'            => 'pending',
                    'admin_notes'       => null
                ]);
                $application = $existingApp;
            } else {
                $application = AffiliateApplication::create([
                    'user_id'           => $user->id,
                    'social_links'      => $request->social_links,
                    'introduce_message' => $request->introduce_message,
                    'status'            => 'pending'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Nộp đơn đăng ký thành công! Vui lòng chờ SORA xét duyệt.',
                'data'    => $application
            ], 201);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Không thể gửi đơn đăng ký lúc này. Vui lòng thử lại sau.'], 500);
        }
    }

    // rút tiền hoa hồng về tài khoản ngân hàng
    public function withdraw(Request $request)
    {
        $request->validate([
            'amount'              => 'required|numeric|min:200000',
            'bank_name'           => 'required|string|max:255',
            'account_number'      => 'required|string|max:50',
            'account_holder_name' => 'required|string|max:255',
        ], [
            'amount.min' => 'Số tiền rút tối thiểu phải từ 200.000đ trở lên.'
        ]);

        /** @var \App\Models\User $currentUser */
        $currentUser = Auth::user();

        if (!$currentUser->is_affiliate) {
            return response()->json([
                'success' => false, 
                'message' => 'Quyền truy cập bị từ chối. Bạn chưa phải là Đối tác chính thức của SORA.'
            ], 403);
        }

        DB::beginTransaction();
        try {
            /** @var \App\Models\User $user */
            $user = \App\Models\User::where('id', $currentUser->id)->lockForUpdate()->first();

            if ((float)$user->commission_balance < (float)$request->amount) {
                // Nhớ RollBack nếu không đủ tiền nhé
                DB::rollBack();
                return response()->json(['success' => false, 'message' => 'Số dư khả dụng trong ví không đủ để thực hiện lệnh này.'], 400);
            }

            $description = "Rút tiền về [{$request->bank_name}] - STK: {$request->account_number} - Tên: " . strtoupper($request->account_holder_name);

            CommissionHistory::create([
                'user_id'     => $user->id,
                'order_id'    => null,
                'amount'      => $request->amount,
                'type'        => 'withdraw',
                'status'      => 'pending',
                'description' => $description,
                'created_at'  => now()
            ]);

            $user->commission_balance -= $request->amount;
            $user->save();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Yêu cầu rút tiền đã được gửi thành công! Bộ phận Kế toán SORA sẽ kiểm tra và chuyển khoản cho bạn trong vòng 24h.'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            report($e);
            return response()->json(['success' => false, 'message' => 'Không thể xử lý yêu cầu rút tiền lúc này. Vui lòng thử lại sau.'], 500);
        }
    }
}
