<?php

namespace App\Http\Controllers\Api\client;

use App\Http\Controllers\Controller;
use App\Models\AffiliateApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ClientAffiliateController extends Controller
{
    // lấy status affiliate của user hiện tại
    public function status()
    {
        try {
            $user = Auth::user();
            $application = AffiliateApplication::where('user_id', $user->id)->first();

            return response()->json([
                'success' => true,
                'data' => [
                    'is_affiliate' => $user->is_affiliate,
                    'affiliate_code' => $user->affiliate_code,
                    'commission_balance' => $user->commission_balance,
                    'application' => $application
                ]
            ], 200);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    // gửi đơn đăng ký làm affiliate
    public function apply(Request $request)
    {
        try {
            $user = Auth::user();

            $existingApp = AffiliateApplication::where('user_id', $user->id)->first();
            if ($existingApp && in_array($existingApp->status, ['pending', 'approved'])) {
                return response()->json(['success' => false, 'message' => 'Bạn đã nộp đơn đăng ký rồi!'], 400);
            }

            $request->validate([
                'social_links' => 'required|string',
                'introduce_message' => 'required|string|max:1000'
            ]);

            if ($existingApp && $existingApp->status === 'rejected') {
                $existingApp->update([
                    'social_links' => $request->social_links,
                    'introduce_message' => $request->introduce_message,
                    'status' => 'pending',
                    'admin_notes' => null
                ]);
                $application = $existingApp;
            } else {
                $application = AffiliateApplication::create([
                    'user_id' => $user->id,
                    'social_links' => $request->social_links,
                    'introduce_message' => $request->introduce_message,
                    'status' => 'pending'
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Nộp đơn đăng ký thành công! Vui lòng chờ SORA xét duyệt.',
                'data' => $application
            ], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }
}