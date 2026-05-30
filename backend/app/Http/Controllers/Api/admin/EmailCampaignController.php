<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\EmailCampaignSetting;
use App\Models\EmailLog;
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

            $logs = $query->get();
            $birthdayVoucherCodes = $logs
                ->where('event_type', 'birthday')
                ->pluck('voucher_code')
                ->filter()
                ->values();

            if ($birthdayVoucherCodes->isNotEmpty()) {
                \App\Models\Coupon::whereIn('code', $birthdayVoucherCodes)
                    ->where('type', 'birthday')
                    ->where('is_used', 0)
                    ->forceDelete();
            }

            $deleted = $logs->each->delete()->count();

            return response()->json([
                'success' => true,
                'deleted_count' => $deleted,
                'message' => 'Da xoa lich su gui email.',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Loi khi xoa lich su: ' . $e->getMessage(),
            ]);
        }
    }

    public function settings()
    {
        $setting = EmailCampaignSetting::current();

        return response()->json([
            'success' => true,
            'data' => $this->formatSetting($setting),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $validated = $request->validate([
            'is_auto_birthday' => 'sometimes|boolean',
            'birthday_subject' => 'required|string|max:255',
            'birthday_content' => 'nullable|string',
        ]);

        $setting = EmailCampaignSetting::current();
        $setting->update([
            'is_auto_birthday' => (bool) ($validated['is_auto_birthday'] ?? false),
            'birthday_subject' => $validated['birthday_subject'],
            'birthday_content' => $validated['birthday_content'] ?? '',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Da luu cau hinh sinh nhat.',
            'data' => $this->formatSetting($setting->refresh()),
        ]);
    }

    public function triggerBirthday()
    {
        try {
            return response()->json($this->emailCampaignService->sendBirthdayCampaign());
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
            return response()->json($this->emailCampaignService->sendHolidayCampaign());
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
