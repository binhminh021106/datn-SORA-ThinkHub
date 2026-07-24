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
        
        // Load linh hoạt danh sách hạng thành viên từ Database thay vì hard-code
        $dbTiers = \App\Models\MembershipTier::orderBy('min_spent', 'asc')->get();
        $savedTiers = collect($setting->birthday_tiers ?? []);

        $tiersData = $dbTiers->map(function ($tier) use ($savedTiers) {
            $saved = $savedTiers->firstWhere('tier_id', $tier->id) ?? [];
            return [
                'tier_id' => $tier->id,
                'name' => $tier->name,
                'voucherCode' => $saved['voucherCode'] ?? '',
                'type' => $saved['type'] ?? 'fixed',
                'value' => $saved['value'] ?? 0,
                'min_spend' => $saved['min_spend'] ?? 0,
                'usage_limit' => $saved['usage_limit'] ?? 100,
                'usage_limit_per_user' => $saved['usage_limit_per_user'] ?? 1,
                'validity_days' => $saved['validity_days'] ?? 7, // Thời hạn tính từ ngày sinh nhật
                'status' => $saved['status'] ?? 'active',
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'is_auto_birthday' => (bool) $setting->is_auto_birthday,
                'birthday_subject' => $setting->birthday_subject,
                'birthday_content' => $setting->birthday_content,
                'tiers'            => $tiersData,
            ],
        ]);
    }

    public function updateSettings(Request $request)
    {
        // Áp dụng bộ validation chuẩn của hệ thống Coupon
        $validated = $request->validate([
            'is_auto_birthday' => 'sometimes|boolean',
            'birthday_subject' => 'required|string|max:255',
            'birthday_content' => 'nullable|string',
            'tiers' => 'required|array',
            'tiers.*.tier_id' => 'required|integer|exists:membership_tiers,id|distinct',
            'tiers.*.name' => 'required|string',
            'tiers.*.voucherCode' => 'nullable|string|distinct',
            'tiers.*.type' => 'required|in:fixed,percentage',
            'tiers.*.value' => 'required|numeric|min:0',
            'tiers.*.min_spend' => 'required|numeric|min:0',
            'tiers.*.usage_limit' => 'required|numeric|min:1',
            'tiers.*.usage_limit_per_user' => 'required|numeric|min:1',
            'tiers.*.validity_days' => 'required|numeric|min:1',
            'tiers.*.status' => 'required|in:active,inactive',
        ]);

        $setting = EmailCampaignSetting::current();
        
        \Illuminate\Support\Facades\DB::transaction(function () use ($setting, $validated) {
            $setting->update([
                'is_auto_birthday' => (bool) ($validated['is_auto_birthday'] ?? false),
                'birthday_subject' => $validated['birthday_subject'],
                'birthday_content' => $validated['birthday_content'] ?? '',
                'birthday_tiers'   => $validated['tiers'],
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu cấu hình sinh nhật.',
            'data' => $this->settings()->getData()->data,
        ]);
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
