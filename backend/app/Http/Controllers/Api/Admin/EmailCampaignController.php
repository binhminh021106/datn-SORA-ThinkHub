<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaignSetting;
use App\Models\EmailLog;
use App\Models\Coupon;
use App\Services\EmailCampaignService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class EmailCampaignController extends Controller
{
    public function __construct(private EmailCampaignService $emailCampaignService)
    {
    }

    public function recentLogs()
    {
        try {
            $logs = EmailLog::with('user:id,fullName,email')
                ->when(request('type') === 'birthday', function ($query) {
                    $query->where('event_type', 'birthday');
                })
                ->when(request('type') === 'holiday', function ($query) {
                    $query->where('event_type', 'like', 'holiday_%');
                })
                ->orderBy('sent_at', 'desc')
                ->take(20)
                ->get()
                ->each(function ($log) {
                    if ($log->user) {
                        $log->user->name = $log->user->fullName;
                    }
                });

            return response()->json(['success' => true, 'data' => $logs]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Loi DB khi lay lich su: ' . $e->getMessage(),
            ]);
        }
    }

  public function clearLogs(Request $request)
    {
        try {
            $query = EmailLog::query();

            if ($request->input('type') === 'birthday') {
                $query->where('event_type', 'birthday');
            } elseif ($request->input('type') === 'holiday') {
                $query->where('event_type', 'like', 'holiday_%');
            }

            // CHỈ CẦN GỌI DELETE TRỰC TIẾP TRÊN QUERY LOGS
            $deleted = $query->delete();

            return response()->json([
                'success' => true,
                'deleted_count' => $deleted,
                'message' => 'Đã xóa lịch sử gửi email thành công.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi xóa lịch sử: ' . $e->getMessage(),
            ]);
        }
    }

    public function settings()
    {
        $setting = EmailCampaignSetting::current();

       return response()->json([
            'success' => true,
            'data' => [
                'is_auto_birthday' => (bool) $setting->is_auto_birthday,
                'birthday_subject' => $setting->birthday_subject,
                'birthday_content' => $setting->birthday_content,
                'tiers'            => $setting->birthday_tiers ?? [], // Trả data thật về Vue
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'is_auto_birthday' => 'sometimes|boolean',
            'birthday_subject' => 'required|string|max:255',
            'birthday_content' => 'nullable|string',
            'tiers' => 'required|array',
            'tiers.*.id' => 'required|string',
            'tiers.*.name' => 'required|string',
            'tiers.*.voucherCode' => 'required|string',
            'tiers.*.discount' => 'required|string',
        ]);

        $setting = EmailCampaignSetting::current();
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($setting, $validated) {
            $setting->update([
                'is_auto_birthday' => (bool) ($validated['is_auto_birthday'] ?? false),
                'birthday_subject' => $validated['birthday_subject'],
                'birthday_content' => $validated['birthday_content'] ?? '',
                'birthday_tiers'   => $validated['tiers'],
            ]);
            $this->syncBirthdayVouchers($validated['tiers']);
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu cấu hình sinh nhật.',
            
            'data' => $this->settings()->getData()->data,
        ]);
    }
private function syncBirthdayVouchers(array $tiers): void
    {
        foreach ($tiers as $tier) {
            if (empty($tier['voucherCode']) || empty($tier['discount'])) {
                continue;
            }

            $rawDiscount = trim($tier['discount']);
            $lowerDiscount = mb_strtolower($rawDiscount, 'UTF-8');
            
            // Nhận diện Freeship
            $isFreeship = str_contains($lowerDiscount, 'miễn phí') || str_contains($lowerDiscount, 'freeship');
            $isPercentage = str_contains($rawDiscount, '%');
            $numericValue = (float) preg_replace('/[^0-9.]/', '', $rawDiscount);

      
            if ($numericValue <= 0 && !$isFreeship) continue;

            $couponName = 'Quà tặng sinh nhật hạng: ' . $tier['name'];
            $coupon = Coupon::query()->firstOrNew([
                'code' => $tier['voucherCode'],
                'name' => $couponName
            ]);
            
            if ($isFreeship) {
                $coupon->type = 'freeship';
                $coupon->value = 0;
            } else {
                $coupon->type = $isPercentage ? 'percentage' : 'fixed';
                $coupon->value = $numericValue;
            }

            if (!$coupon->exists) {
                $coupon->min_spend = 0;
                $coupon->status = 'active';
                $coupon->usage_count = 0;
                $coupon->is_used = false;
            }

            $coupon->save();
        }
    }

public function triggerBirthday()
    {
        try {
            // Truyền tham số để bỏ qua check AutoSetting nhưng BẬT check chống trùng lặp
            return response()->json($this->emailCampaignService->sendBirthdayCampaign(
                respectAutoSetting: false, 
                preventDuplicateSends: true
            ));
        } catch (\Throwable $e) {
            Log::error('triggerBirthday failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Loi Server: ' . $e->getMessage() . ' (Dong ' . $e->getLine() . ')',
            ]);
        }
    }

    public function triggerHoliday()
    {
        try {
            // Bật cờ preventDuplicateSends thành true khi trigger bằng tay
            return response()->json($this->emailCampaignService->sendHolidayCampaign(preventDuplicateSends: true));
        } catch (\Throwable $e) {
            Log::error('triggerHoliday failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Loi Server: ' . $e->getMessage() . ' (Dong ' . $e->getLine() . ')',
            ]);
        }
    }

 
    private function formatSetting(EmailCampaignSetting $setting): array
    {
        return [
            'is_auto_birthday' => (bool) $setting->is_auto_birthday,
            'birthday_subject' => $setting->birthday_subject,
            'birthday_content' => $setting->birthday_content,
        ];
    }
}
