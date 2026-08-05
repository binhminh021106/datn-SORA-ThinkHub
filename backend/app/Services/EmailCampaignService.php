<?php

namespace App\Services;

use App\Mail\BirthdayVoucherMail;
use App\Mail\HolidayCouponMail;
use App\Models\Coupon;
use App\Models\EmailCampaignSetting;
use App\Models\EmailLog;
use App\Models\HolidayEvent;
use App\Models\MembershipTier;
use App\Models\User;
use App\Services\AudienceFilterService; 
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

// chức năng: gửi email chiến dịch sinh nhật và ngày lễ, bao gồm việc tạo mã giảm giá (coupon) dựa trên cấu hình của Admin, lọc đối tượng người dùng theo tiêu chí, và quản lý trạng thái gửi email.
class EmailCampaignService
{
    private string $birthdayColumn = 'birthday'; // Nhớ đảm bảo cột này đúng với DB của bạn
    private string $genderColumn = 'gender';

    public function sendBirthdayCampaign(bool $respectAutoSetting = false, bool $preventDuplicateSends = false): array
    {
        $setting = EmailCampaignSetting::current();

        if ($respectAutoSetting && !$setting->is_auto_birthday) {
            return [
                'success' => true,
                'sent_count' => 0,
                'message' => 'Email sinh nhật tự động đang tắt.',
            ];
        }

        $today = Carbon::now();
        $birthdayUsers = User::with('tier')
            ->whereMonth($this->birthdayColumn, $today->month)
            ->whereDay($this->birthdayColumn, $today->day)
            ->whereNotNull('email')
            ->get();

        if ($birthdayUsers->isEmpty()) {
            return [
                'success' => true,
                'sent_count' => 0,
                'message' => 'Hôm nay không có khách hàng nào sinh nhật.',
            ];
        }

        $queuedCount = 0;
        $failedCount = 0;
        $skippedCount = 0;

        foreach ($birthdayUsers as $user) {
            $emailLog = null;
            if ($preventDuplicateSends) {
                $alreadySent = EmailLog::where('user_id', $user->id)
                    ->where('event_type', 'birthday')
                    ->whereIn('status', ['success', 'queued'])
                    ->whereYear('sent_at', $today->year)
                    ->exists();

                if ($alreadySent) {
                    continue;
                }
            }

            try {
                

                // Lấy mã Coupon theo đúng cấu hình Admin đã cài đặt
                $coupon = $this->createBirthdayCoupon($user, $today);

                // Nếu hạng của User không được Admin cấu hình mã quà tặng thì bỏ qua
                if (!$coupon) {
                    $skippedCount++;
                    continue; 
                }

                $emailLog = EmailLog::create([
                    'user_id' => $user->id,
                    'event_type' => 'birthday',
                    'queued_at' => now(),
                    'status' => 'queued',
                    'voucher_code' => $coupon->code,
                    'action_url' => $this->shopCouponUrl($coupon->code),
                ]);

                Mail::to($user->email)->queue(new BirthdayVoucherMail($user, $coupon, $emailLog->id));
                $queuedCount++;
            } catch (\Throwable $e) {
                Log::error("Birthday campaign mail failed for user {$user->id}: {$e->getMessage()}");
                $failedCount++;
                if (isset($emailLog)) {
                    $emailLog->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                } else {
                    $this->logFailedEmail($user->id, 'birthday', $e->getMessage());
                }
            }
        }

        return [
            'success' => $failedCount === 0,
            'sent_count' => 0,
            'queued_count' => $queuedCount,
            'failed_count' => $failedCount,
            'skipped_count' => $skippedCount,
            'message' => "Đã xếp {$queuedCount} email sinh nhật vào queue; {$failedCount} email lỗi, {$skippedCount} email bị bỏ qua.",
        ];
    }

    public function sendHolidayCampaign(bool $preventDuplicateSends = false): array
    {
        $today = Carbon::now();
        $todayStr = $today->format('d/m');

        $eventsToday = HolidayEvent::where('status', 'active')
            ->where('event_date', $todayStr)
            ->get();

        if ($eventsToday->isEmpty()) {
            return [
                'success' => true,
                'sent_count' => 0,
                'message' => 'Hôm nay không có sự kiện ngày lễ nào được cài đặt.',
            ];
        }

        $totalQueuedCount = 0;
        $totalFailedCount = 0;
        
        $audienceService = new AudienceFilterService();

       foreach ($eventsToday as $event) {
            $targets = $this->normalizeTargetAudience($event->getRawOriginal('target_audience') ?? $event->target_audience);
            $targetUsers = $audienceService->getTargetedUsers($targets);
            $targetUsers->load('tier');

            $eventTypeKey = 'holiday_' . $event->id;

            // ĐƯA TRUY VẤN RA NGOÀI VÒNG LẶP USER:
            // 1. Kiểm tra sự kiện 1 lần duy nhất cho mỗi event
            $eventStillSendable = HolidayEvent::whereKey($event->id)
                ->where('status', 'active')
                ->where('event_date', $todayStr)
                ->exists();

            if (!$eventStillSendable) {
                continue; // Bỏ qua sự kiện này nếu đã bị tắt
            }

            // 2. Pre-fetch toàn bộ ID của user đã được gửi email thành công trong năm nay
            $sentUserIds = [];
            if ($preventDuplicateSends) {
                $sentUserIds = EmailLog::where('event_type', $eventTypeKey)
                    ->whereIn('status', ['success', 'queued'])
                    ->whereYear('sent_at', $today->year)
                    ->pluck('user_id')
                    ->toArray();
            }

            foreach ($targetUsers as $user) {
                $emailLog = null;
                // Kiểm tra trùng lặp bằng array PHP trên RAM, thay vì gọi DB
                if ($preventDuplicateSends && in_array($user->id, $sentUserIds, true)) {
                    continue;
                }

                try {
                    $emailLog = EmailLog::create([
                        'user_id' => $user->id,
                        'event_type' => $eventTypeKey,
                        'queued_at' => now(),
                        'status' => 'queued',
                        'voucher_code' => $event->voucher_code,
                        'action_url' => $event->voucher_code ? $this->shopCouponUrl($event->voucher_code) : $this->shopUrl(),
                    ]);

                    Mail::to($user->email)->queue(new HolidayCouponMail($user, $event, null, $emailLog->id));
                    $totalQueuedCount++;
                } catch (\Throwable $e) {
                    Log::error("Holiday campaign mail failed for user {$user->id}, event {$event->id}: {$e->getMessage()}");
                    $totalFailedCount++;
                    if (isset($emailLog)) {
                        $emailLog->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                    } else {
                        $this->logFailedEmail($user->id, $eventTypeKey, $e->getMessage());
                    }
                }
            }
        }

        return [
            'success' => $totalFailedCount === 0,
            'sent_count' => 0,
            'queued_count' => $totalQueuedCount,
            'failed_count' => $totalFailedCount,
            'message' => "Đã xếp {$totalQueuedCount} email sự kiện vào queue; {$totalFailedCount} email lỗi.",
        ];
    }

    // ================= HELPER METHODS =================

    /**
     * Tạo hoặc lấy Voucher sinh nhật dựa trên cấu hình của Admin
     */
  /**
     * Tạo hoặc lấy Voucher sinh nhật dựa trên cấu hình của Admin
     */
  private function createBirthdayCoupon(User $user, Carbon $today): ?Coupon
    {
        $setting = EmailCampaignSetting::current();
        $tiers = $setting->birthday_tiers ?? [];
        
        if (!$user->tier_id) return null;  

        $matchedTierConfig = collect($tiers)->firstWhere('tier_id', $user->tier_id);

        if (!$matchedTierConfig || empty($matchedTierConfig['voucherCode']) || $matchedTierConfig['status'] !== 'active') {
            return null; 
        }

        $baseCode = $matchedTierConfig['voucherCode'];
        // Tạo mã độc nhất cho từng user theo năm (VD: TIERKC-U15-2026)
        $couponCode = $baseCode . '-U' . $user->id . '-' . $today->year;

        $validityDays = $matchedTierConfig['validity_days'] ?? 7;
        $requiredExpiration = $today->copy()->addDays($validityDays)->endOfDay();

        try {
            return Coupon::firstOrCreate(
                ['code' => $couponCode],
                [
                    'type' => $matchedTierConfig['type'],
                    'name' => 'Quà tặng sinh nhật hạng: ' . $matchedTierConfig['name'],
                    'min_spend' => $matchedTierConfig['min_spend'],
                    'value' => $matchedTierConfig['value'],
                    'usage_limit' => $matchedTierConfig['usage_limit'],
                    'usage_limit_per_user' => $matchedTierConfig['usage_limit_per_user'],
                    'usage_count' => 0,
                    'status' => $matchedTierConfig['status'],
                    'expires_at' => $requiredExpiration, 
                    'user_id' => $user->id, 
                    'tier_id' => $user->tier_id,
                    'is_used' => false
                ]
            );
        } catch (\Illuminate\Database\QueryException $e) {
            // 23000 = Integrity constraint violation (Duplicate entry)
            if ($e->getCode() == 23000) {
                $existing = Coupon::where('code', $couponCode)->first();
                if ($existing) {
                    return $existing;
                }
            }
            throw $e;
        }
    }
  
   
  
    private function getUserTierName(User $user): string
    {
        if (!$user->tier_id) return 'regular';
        
        $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        if (!$userTier) return 'regular';

        $name = mb_strtolower($userTier->name, 'UTF-8');

        if (str_contains($name, 'silver') || str_contains($name, 'bạc')) {
            return 'silver';
        }
        if (str_contains($name, 'gold') || str_contains($name, 'vàng')) {
            return 'gold';
        }
        if (str_contains($name, 'diamond') || str_contains($name, 'kim cương')) {
            return 'diamond';
        }

        return 'regular';
    }
 private function isSilverTierOrAbove(User $user): bool
    {
        if (!$user->tier_id) {
            return false;
        }

        $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        if (!$userTier) return false;

        // Bỏ qua hạng cơ bản nhất (index 0), lấy mốc cấu hình của hạng kế tiếp (Silver)
        $silverTier = MembershipTier::orderBy('min_spent', 'asc')->skip(1)->first();
        if (!$silverTier) return false; // Nếu không có hạng thứ 2, không ai đạt hạng Silver

        return (float) $userTier->min_spent >= (float) $silverTier->min_spent;
    }

    private function normalizeTargetAudience($targetAudience): array
    {
        if (is_array($targetAudience)) {
            $targets = $targetAudience;
        } else {
            $rawTarget = trim((string) $targetAudience);
            if ($rawTarget === '') {
                return ['all'];
            }

            $decoded = json_decode($rawTarget, true);
            $targets = json_last_error() === JSON_ERROR_NONE && is_array($decoded)
                ? $decoded
                : explode(',', $rawTarget);
        }

        $targets = array_map(static fn ($target) => trim((string) $target), $targets);
        $targets = array_values(array_filter($targets));

        return $targets ?: ['all'];
    }

    private function logFailedEmail(int $userId, string $eventType, ?string $errorMessage = null): void
    {
        EmailLog::create([
            'user_id' => $userId,
            'event_type' => $eventType,
            'sent_at' => now(),
            'status' => 'failed',
            'error_message' => $errorMessage,
        ]);
    }

    private function shopUrl(): string
    {
        return rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/') . '/shop';
    }

    private function shopCouponUrl(?string $code): string
    {
        if (!$code) {
            return $this->shopUrl();
        }
        return $this->shopUrl() . '?coupon=' . urlencode($code);
    }
}
