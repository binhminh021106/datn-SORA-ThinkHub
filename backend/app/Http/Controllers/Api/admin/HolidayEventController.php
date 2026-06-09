<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon; // ĐÃ FIX LỖI 500: Bổ sung namespace Coupon
use App\Models\EmailLog;
use App\Models\HolidayEvent;
use Illuminate\Http\Request;

class HolidayEventController extends Controller
{
    public function index()
    {
        $events = HolidayEvent::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $events]);
    }

    public function store(Request $request)
    {
        $this->mergeEventDate($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_date' => ['required', 'string', 'max:5', 'regex:/^\d{2}\/\d{2}$/'],
            'target_audience' => 'required|string',
            'email_subject' => 'required|string',
            'email_content' => 'required|string',
            'voucher_code' => 'nullable|string',
            'discount' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $discount = $validated['discount'] ?? null;
        
        // Bắt buộc XÓA discount khỏi $validated để không gây lỗi SQL bảng holiday_events
        unset($validated['discount']); 

        $event = HolidayEvent::create($validated);

        // Tự động tạo và lưu Coupon
        if (!empty($validated['voucher_code']) && !empty($discount)) {
            $coupon = Coupon::where('code', $validated['voucher_code'])->first();
            if (!$coupon) {
                $coupon = new Coupon();
                $coupon->code = $validated['voucher_code'];
                $coupon->name = 'Quà tặng lễ: ' . $validated['name'];
                
                // Gán giá trị mặc định để vượt qua Validate của Database
                $coupon->type = 'fixed';
                $coupon->value = 0;
                $coupon->min_spend = 0;
                $coupon->usage_count = 0;
                $coupon->status = 'active';
                $coupon->save();
            }
            $this->updateVoucherDiscount($validated['voucher_code'], $discount);
        }

        return response()->json([
            'success' => true,
            'message' => 'Them su kien thanh cong',
            'data' => $event,
        ]);
    }

    public function show($id)
    {
        $event = HolidayEvent::find($id);
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Su kien khong ton tai hoac da bi xoa.',
            ], 404);
        }

        if ($event->voucher_code) {
            $coupon = Coupon::where('code', $event->voucher_code)->first();
            $event->setAttribute('discount', $this->formatCouponDiscount($coupon));
            $event->setAttribute('applicable_scope', $this->formatCouponApplicableScope($coupon));
            $event->setAttribute('expires_at_label', $this->formatCouponExpiresAt($coupon));
        }

        return response()->json(['success' => true, 'data' => $event]);
    }

    public function update(Request $request, $id)
    {
        $event = HolidayEvent::findOrFail($id);
        $this->mergeEventDate($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'event_date' => ['required', 'string', 'max:5', 'regex:/^\d{2}\/\d{2}$/'],
            'target_audience' => 'required|string',
            'email_subject' => 'required|string',
            'email_content' => 'required|string',
            'voucher_code' => 'nullable|string',
            'discount' => 'nullable|string|max:50',
            'status' => 'required|in:active,inactive',
        ]);

        $discount = $validated['discount'] ?? null;
        unset($validated['discount']);

        $event->update($validated);

        if (!empty($validated['voucher_code']) && !empty($discount)) {
            $coupon = Coupon::where('code', $validated['voucher_code'])->first();
            if (!$coupon) {
                $coupon = new Coupon();
                $coupon->code = $validated['voucher_code'];
                $coupon->name = 'Quà tặng lễ: ' . $validated['name'];
                $coupon->type = 'fixed';
                $coupon->value = 0;
                $coupon->min_spend = 0;
                $coupon->usage_count = 0;
                $coupon->status = 'active';
                $coupon->save();
            }
            $this->updateVoucherDiscount($validated['voucher_code'], $discount);
        }

        return response()->json(['success' => true, 'message' => 'Cap nhat thanh cong']);
    }

    public function destroy($id)
    {
        $event = HolidayEvent::find($id);
        if (!$event) {
            return response()->json([
                'success' => false,
                'message' => 'Su kien khong ton tai hoac da bi xoa.',
            ], 404);
        }

        EmailLog::where('event_type', 'holiday_' . $event->id)->delete();
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Xoa su kien va lich su gui lien quan thanh cong',
        ]);
    }

    private function mergeEventDate(Request $request): void
    {
        if (!$request->filled('day') || !$request->filled('month')) {
            return;
        }

        $request->merge([
            'event_date' => str_pad((string) $request->input('day'), 2, '0', STR_PAD_LEFT)
                . '/'
                . str_pad((string) $request->input('month'), 2, '0', STR_PAD_LEFT),
        ]);
    }

    private function updateVoucherDiscount(?string $voucherCode, ?string $discount): void
    {
        if (!$voucherCode || !$discount) {
            return;
        }

        $coupon = Coupon::where('code', $voucherCode)->first();
        if (!$coupon) {
            return;
        }

        $rawDiscount = trim($discount);
        $normalizedDiscount = preg_replace('/[^0-9.,]/', '', $rawDiscount);
        if (str_contains($normalizedDiscount, ',') && str_contains($normalizedDiscount, '.')) {
            $normalizedDiscount = str_replace('.', '', $normalizedDiscount);
            $normalizedDiscount = str_replace(',', '.', $normalizedDiscount);
        } elseif (str_contains($normalizedDiscount, ',') || substr_count($normalizedDiscount, '.') > 1) {
            $normalizedDiscount = str_replace('.', '', $normalizedDiscount);
            $normalizedDiscount = str_replace(',', '.', $normalizedDiscount);
        } elseif (preg_match('/\.\d{3}$/', $normalizedDiscount)) {
            $normalizedDiscount = str_replace('.', '', $normalizedDiscount);
        }
        $numericValue = (float) $normalizedDiscount;
        if ($numericValue <= 0) {
            return;
        }

        $coupon->value = $numericValue;
        if (str_contains($rawDiscount, '%')) {
            $coupon->type = 'percentage';
        } elseif (preg_match('/(đ|d|vnd)/i', $rawDiscount)) {
            $coupon->type = 'fixed';
        }
        $coupon->save();
    }

    private function formatCouponDiscount(?Coupon $coupon): ?string
    {
        if (!$coupon || $coupon->value === null) {
            return null;
        }

        $value = (float) $coupon->value;
        $formattedValue = floor($value) === $value
            ? number_format($value, 0, ',', '.')
            : number_format($value, 2, ',', '.');

        return $coupon->type === 'percentage'
            ? $formattedValue . '%'
            : $formattedValue . 'đ';
    }

    private function formatCouponApplicableScope(?Coupon $coupon): ?string
    {
        if (!$coupon) {
            return null;
        }

        $minSpend = (float) ($coupon->min_spend ?? 0);

        if ($minSpend > 0) {
            return 'Đơn hàng từ ' . number_format($minSpend, 0, ',', '.') . 'đ';
        }

        return 'Mọi đơn hàng hợp lệ';
    }

    private function formatCouponExpiresAt(?Coupon $coupon): ?string
    {
        if (!$coupon) {
            return null;
        }

        if (!$coupon->expires_at) {
            return 'Không giới hạn';
        }

        return \Carbon\Carbon::parse($coupon->expires_at)->format('d/m/Y');
    }
}