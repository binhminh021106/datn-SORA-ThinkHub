<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\EmailLog;
use App\Models\HolidayEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Carbon\Carbon;


class HolidayEventController extends Controller
{
    public function index()
    {
        $events = HolidayEvent::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $events]);
    }

    public function store(Request $request)
    {
        try {
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
                'expires_at' => 'nullable|string',
            ]);

            $discount = $validated['discount'] ?? null;
            $expiresAt = $validated['expires_at'] ?? null; 
            
            unset($validated['discount'], $validated['expires_at']); 

            $event = HolidayEvent::create($validated);

            $this->syncVoucherDiscount([
                'voucher_code' => $request->input('voucher_code'),
                'name' => $validated['name']
            ], $discount, $expiresAt);

            return response()->json([
                'success' => true,
                'message' => 'Them su kien thanh cong',
                'data' => $event,
            ]);

        } catch (\Throwable $e) {
            // ĐÂY LÀ CHÌA KHÓA: Ép lỗi in thẳng ra Response thay vì giấu đi
            return response()->json([
                'success' => false,
                'message' => 'LỖI CHÍNH XÁC LÀ: ' . $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ], 500);
        }
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
            'expires_at' => 'nullable|string', // THÊM VALIDATION
        ]);

        $discount = $validated['discount'] ?? null;
        $expiresAt = $validated['expires_at'] ?? null;
        
        unset($validated['discount'], $validated['expires_at']);

        $event->update($validated);

        $this->syncVoucherDiscount($validated, $discount, $expiresAt);

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

  private function syncVoucherDiscount(array $eventData, ?string $discount): void
    {
        if (empty($eventData['voucher_code']) || empty($discount)) {
            return;
        }

        $discountData = $this->parseDiscount($discount);
        if (!$discountData) return;

        $coupon = Coupon::firstOrNew(['code' => $eventData['voucher_code']]);
        
        $coupon->name = 'Qua tang le: ' . $eventData['name'];
        $coupon->type = $discountData['type'];
        $coupon->value = $discountData['value'];
        $coupon->min_spend = 0;
        $coupon->usage_count = 0;
        $coupon->status = 'active';

        // CHÌA KHÓA FIX 500: Cột is_used không có giá trị mặc định trong DB
        // Bắt buộc phải khởi tạo giá trị false (0) khi tạo mã mới.
        if (!$coupon->exists) {
            $coupon->is_used = false; 
        }
        
        // TÍNH TOÁN HẠN SỬ DỤNG (+3 NGÀY) CHUẨN XÁC TẠI BACKEND
        if (!empty($eventData['event_date'])) {
            $currentYear = now()->year;
            try {
                $eventDateObj = Carbon::createFromFormat('d/m/Y', $eventData['event_date'] . '/' . $currentYear);
                $coupon->expires_at = $eventDateObj->addDays(3)->endOfDay(); 
            } catch (\Exception $e) {
                $coupon->expires_at = null;
            }
        } else {
            $coupon->expires_at = null; 
        }
        
        $coupon->save();
    }
   private function parseDiscount(string $discount): ?array
{
    $rawDiscount = trim($discount);
    $normalizedDiscount = $this->normalizeNumericString($rawDiscount);
    $numericValue = (float) $normalizedDiscount;

    if ($numericValue <= 0) return null;

    // Logic: Nếu không có % hoặc không có 'đ' thì mặc định là phần trăm
    $isFixed = Str::contains(Str::lower($rawDiscount), 'đ') || Str::contains(Str::lower($rawDiscount), 'vnd');
    
    return [
        'type' => $isFixed ? 'fixed' : 'percentage',
        'value' => $numericValue,
    ];
}
    private function normalizeNumericString(string $input): string
    {
        $value = preg_replace('/[^0-9.,]/', '', $input);
        if (!$value) {
            return '';
        }

        $lastComma = strrpos($value, ',');
        $lastDot = strrpos($value, '.');

        if ($lastComma !== false && $lastDot !== false) {
            $decimalSeparator = $lastComma > $lastDot ? ',' : '.';
            $thousandSeparator = $decimalSeparator === ',' ? '.' : ',';

            return str_replace($decimalSeparator, '.', str_replace($thousandSeparator, '', $value));
        }

        if ($lastComma !== false) {
            return preg_match('/^\d{1,3}(,\d{3})+$/', $value)
                ? str_replace(',', '', $value)
                : str_replace(',', '.', $value);
        }

        if ($lastDot !== false && preg_match('/^\d{1,3}(\.\d{3})+$/', $value)) {
            return str_replace('.', '', $value);
        }

        return $value;
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