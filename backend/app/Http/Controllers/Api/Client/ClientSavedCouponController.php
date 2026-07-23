<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\UserSavedCoupon;
use Illuminate\Http\Request;

class ClientSavedCouponController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Lấy danh sách voucher đã lưu
        $savedCoupons = UserSavedCoupon::with('coupon')
            ->where('user_id', $user->id)
            ->latest('saved_at')
            ->get()
            ->filter(fn ($item) => $item->coupon)
            ->map(fn ($item) => $this->formatSavedCoupon($item, $user));

        // Lấy thêm voucher sinh nhật theo hạng thành viên (nếu có)
        $birthdayCoupon = null;
        if ($user->tier_id) {
            $birthdayCouponModel = Coupon::where('user_id', $user->id)
                ->where('status', 'active')
                ->where('name', 'LIKE', '%sinh nhật%')
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->whereColumn('usage_count', '<', 'usage_limit')
                ->first();

            if ($birthdayCouponModel) {
                // Kiểm tra xem người dùng đã lưu mã này chưa, nếu rồi thì bỏ qua để tránh lặp
                $alreadySaved = $savedCoupons->contains(fn ($item) => (int) $item['coupon_id'] === (int) $birthdayCouponModel->id);
                
                if (!$alreadySaved) {
                    // Giả lập định dạng giống formatSavedCoupon để FE hiển thị đúng
                    $birthdayCoupon = [
                        'id' => $birthdayCouponModel->id,
                        'name' => $birthdayCouponModel->name,
                        'code' => $birthdayCouponModel->code,
                        'min_spend' => $birthdayCouponModel->min_spend,
                        'type' => $birthdayCouponModel->type,
                        'value' => $birthdayCouponModel->value,
                        'usage_limit' => $birthdayCouponModel->usage_limit,
                        'usage_count' => $birthdayCouponModel->usage_count,
                        'usage_limit_per_user' => $birthdayCouponModel->usage_limit_per_user,
                        'expires_at' => $birthdayCouponModel->expires_at ? $birthdayCouponModel->expires_at->format('Y-m-d H:i:s') : null,
                        'is_used' => false, // Chưa dùng mới hiện
                        'status' => $birthdayCouponModel->status,
                        'saved_at' => now()->format('Y-m-d H:i:s'),
                    ];
                }
            }
        }

        $allCoupons = $savedCoupons->values()->toArray();
        if ($birthdayCoupon) {
            array_unshift($allCoupons, $birthdayCoupon);
        }

        return response()->json([
            'success' => true,
            'data' => $allCoupons,
        ]);
    }

    public function store(Request $request)
    {
        if ($request->filled('code')) {
            $request->merge(['code' => strtoupper(trim((string) $request->input('code')))]);
        }

        $data = $request->validate([
            'coupon_id' => 'nullable|integer|exists:coupons,id',
            'code' => 'nullable|string|max:100',
        ]);

        if (empty($data['coupon_id']) && empty($data['code'])) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng chọn mã giảm giá cần lưu.',
            ], 422);
        }

        $user = $request->user();
        $coupon = Coupon::query()
            ->when(!empty($data['coupon_id']), fn ($query) => $query->where('id', $data['coupon_id']))
            ->when(empty($data['coupon_id']) && !empty($data['code']), fn ($query) => $query->whereRaw('UPPER(code) = ?', [$data['code']]))
            ->first();

        if (!$coupon) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá không tồn tại.',
            ], 404);
        }

        if (!$this->canUserSeeCoupon($coupon, $user)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã giảm giá này không thuộc tài khoản của bạn.',
            ], 403);
        }

        $status = $this->couponStatus($coupon, $user);
        if (!$status['is_selectable']) {
            return response()->json([
                'success' => false,
                'message' => $status['disabled_reason'] ?: 'Mã giảm giá hiện không thể lưu.',
            ], 422);
        }

        $savedCoupon = UserSavedCoupon::firstOrCreate(
            [
                'user_id' => $user->id,
                'coupon_id' => $coupon->id,
            ],
            [
                'saved_at' => now(),
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $savedCoupon->wasRecentlyCreated
                ? 'Đã lưu mã giảm giá vào ví ưu đãi.'
                : 'Mã này đã có trong ví ưu đãi của bạn.',
            'already_saved' => !$savedCoupon->wasRecentlyCreated,
            'data' => $this->formatSavedCoupon($savedCoupon->load('coupon'), $user),
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $deleted = UserSavedCoupon::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy mã đã lưu.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xoá mã khỏi ví ưu đãi.',
        ]);
    }

    private function formatSavedCoupon(UserSavedCoupon $savedCoupon, $user): array
    {
        $coupon = $savedCoupon->coupon;
        $status = $this->couponStatus($coupon, $user);

        return [
            'id' => $savedCoupon->id,
            'coupon_id' => $coupon->id,
            'code' => $coupon->code,
            'name' => $coupon->name,
            'type' => $coupon->type,
            'discount_type' => $coupon->type === 'percentage' ? 'percent' : $coupon->type,
            'value' => (float) $coupon->value,
            'discount_value' => (float) $coupon->value,
            'min_spend' => (float) ($coupon->min_spend ?? 0),
            'min_order_value' => (float) ($coupon->min_spend ?? 0),
            'usage_limit' => $coupon->usage_limit,
            'usage_count' => (int) ($coupon->usage_count ?? 0),
            'usage_limit_per_user' => $coupon->usage_limit_per_user,
            'user_usage_count' => $status['user_usage_count'],
            'expires_at' => optional($coupon->expires_at)->toDateTimeString(),
            'saved_at' => optional($savedCoupon->saved_at)->toDateTimeString(),
            'is_saved' => true,
            'is_active' => $status['is_active'],
            'is_expired' => $status['is_expired'],
            'is_usage_available' => $status['is_usage_available'],
            'is_selectable' => $status['is_selectable'],
            'disabled_reason' => $status['disabled_reason'],
        ];
    }

    private function couponStatus(Coupon $coupon, $user): array
    {
        $isActive = $coupon->status === 'active';
        $isExpired = $coupon->expires_at && now()->greaterThan($coupon->expires_at);
        $isUsageAvailable = $coupon->usage_limit === null || (int) $coupon->usage_count < (int) $coupon->usage_limit;
        $userUsageLimit = (int) ($coupon->usage_limit_per_user ?? 0);
        $userUsageCount = $userUsageLimit > 0 ? $this->countUserCouponUsage($coupon, (int) $user->id) : 0;
        $isUserUsageAvailable = $userUsageLimit <= 0 || $userUsageCount < $userUsageLimit;
        $disabledReason = null;

        if (!$isActive) {
            $disabledReason = 'Mã giảm giá đã tạm ngưng.';
        } elseif ($isExpired) {
            $disabledReason = 'Mã giảm giá đã hết hạn.';
        } elseif (!$isUsageAvailable) {
            $disabledReason = 'Mã giảm giá đã hết lượt sử dụng.';
        } elseif (!$isUserUsageAvailable) {
            $disabledReason = 'Bạn đã sử dụng hết lượt cho mã này.';
        } elseif (str_contains(mb_strtolower($coupon->name, 'UTF-8'), 'sinh nhật') && is_null($coupon->user_id)) {
            $disabledReason = 'Mã giảm giá sinh nhật này đã cũ và không còn hợp lệ.';
        } elseif ($coupon->user_id && (int) $coupon->user_id !== (int) $user->id) {
            $disabledReason = 'Mã giảm giá không thuộc quyền sở hữu của bạn.';
        }

        return [
            'is_active' => $isActive,
            'is_expired' => (bool) $isExpired,
            'is_usage_available' => $isUsageAvailable,
            'is_user_usage_available' => $isUserUsageAvailable,
            'user_usage_count' => $userUsageCount,
            'is_selectable' => $disabledReason === null,
            'disabled_reason' => $disabledReason,
        ];
    }

    private function canUserSeeCoupon(Coupon $coupon, $user): bool
    {
        return $coupon->user_id === null || (int) $coupon->user_id === (int) $user->id;
    }

    private function countUserCouponUsage(Coupon $coupon, int $userId): int
    {
        return Order::where('user_id', $userId)
            ->where('coupon_id', $coupon->id)
            ->where('status', '!=', 'cancelled')
            ->where('payment_status', 'paid')
            ->count();
    }
}
