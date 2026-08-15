<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use App\Models\EmailLog;
use App\Models\HolidayEvent;
use App\Http\Requests\Admin\HolidayEvent\StoreHolidayEventRequest;
use App\Http\Requests\Admin\HolidayEvent\UpdateHolidayEventRequest;
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

  public function store(StoreHolidayEventRequest $request)
    {
        // Validation and merging already handled by HolidayEventRequest
        $validated = $request->validated();

        // 3. Lưu vào Database
        $event = HolidayEvent::create($validated);

        // 4. Đồng bộ Voucher
        $this->syncVoucherDiscount([
            'voucher_code' => $request->input('voucher_code'),
            'name' => $validated['name'],
            'event_date' => $validated['event_date']
        ], $event);

        // 6. Trả về thành công
        return response()->json([
            'success' => true,
            'message' => 'Thêm sự kiện thành công',
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

        if ($event->voucher_code && !$event->discount_value) {
            // Backward compatibility
            $coupon = Coupon::where('code', $event->voucher_code)->first();
            if ($coupon) {
                $event->discount_type = $coupon->type;
                $event->discount_value = $coupon->value;
                $event->min_spend = $coupon->min_spend;
                $event->usage_limit_per_user = $coupon->usage_limit_per_user ?? 1;
            }
        }

        return response()->json(['success' => true, 'data' => $event]);
    }

    public function update(UpdateHolidayEventRequest $request, $id)
    {
        $event = HolidayEvent::findOrFail($id);

        $validated = $request->validated();

        $event->update($validated);

        $this->syncVoucherDiscount([
            'voucher_code' => $request->input('voucher_code'),
            'name' => $validated['name'],
            'event_date' => $validated['event_date']
        ], $event);

        return response()->json(['success' => true, 'message' => 'Cập nhật thành công']);
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



  private function syncVoucherDiscount(array $eventData, HolidayEvent $event): void
    {
        if (empty($eventData['voucher_code']) || empty($event->discount_value)) {
            return;
        }

        $coupon = Coupon::firstOrNew(['code' => $eventData['voucher_code']]);
        
        $coupon->name = 'Qua tang le: ' . $eventData['name'];
        $coupon->type = $event->discount_type ?? 'percentage';
        $coupon->value = $event->discount_value;
        $coupon->min_spend = $event->min_spend ?? 0;
        $coupon->usage_limit_per_user = $event->usage_limit_per_user ?? 1;
        $coupon->usage_count = $coupon->exists ? $coupon->usage_count : 0;
        $coupon->status = 'active';

        if (!$coupon->exists) {
            $coupon->is_used = false; 
        }
        
        if (!empty($eventData['event_date'])) {
            try {
                $eventDateObj = Carbon::createFromFormat('d/m/Y', $eventData['event_date'] . '/' . now()->year)->startOfDay();
                $validityDays = $event->validity_days ?? 7;
                
                if ($eventDateObj->copy()->addDays($validityDays)->endOfDay()->isPast()) {
                    $eventDateObj->addYear();
                }
                $coupon->expires_at = $eventDateObj->addDays($validityDays)->endOfDay(); 
            } catch (\Exception $e) {
                $coupon->expires_at = null;
            }
        } else {
            $coupon->expires_at = null; 
        }
        
        $coupon->save();
    }

}