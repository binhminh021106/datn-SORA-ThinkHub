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

        $sentCount = 0;

        foreach ($birthdayUsers as $user) {
            if ($preventDuplicateSends) {
                $alreadySent = EmailLog::where('user_id', $user->id)
                    ->where('event_type', 'birthday')
                    ->where('status', 'success')
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
                    continue; 
                }

                Mail::to($user->email)->send(new BirthdayVoucherMail($user, $coupon));

                EmailLog::create([
                    'user_id' => $user->id,
                    'event_type' => 'birthday',
                    'sent_at' => now(),
                    'status' => 'success',
                    'voucher_code' => $coupon->code,
                    'action_url' => $this->shopCouponUrl($coupon->code),
                ]);

                $sentCount++;
            } catch (\Throwable $e) {
                Log::error("Birthday campaign mail failed for user {$user->id}: {$e->getMessage()}");
                $this->logFailedEmail($user->id, 'birthday');
            }
        }

        return [
            'success' => true,
            'sent_count' => $sentCount,
            'message' => "Hoàn tất! Đã gửi thành công {$sentCount} email sinh nhật.",
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

        $totalSentCount = 0;
        
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
                    ->where('status', 'success')
                    ->whereYear('sent_at', $today->year)
                    ->pluck('user_id')
                    ->toArray();
            }

            foreach ($targetUsers as $user) {
                // Kiểm tra trùng lặp bằng array PHP trên RAM, thay vì gọi DB
                if ($preventDuplicateSends && in_array($user->id, $sentUserIds, true)) {
                    continue;
                }

                try {
                    Mail::to($user->email)->send(new HolidayCouponMail($user, $event));

                    EmailLog::create([
                        'user_id' => $user->id,
                        'event_type' => $eventTypeKey,
                        'sent_at' => now(),
                        'status' => 'success',
                        'voucher_code' => $event->voucher_code,
                        'action_url' => $event->voucher_code ? $this->shopCouponUrl($event->voucher_code) : $this->shopUrl(),
                    ]);

                    $totalSentCount++;
                } catch (\Throwable $e) {
                    Log::error("Holiday campaign mail failed for user {$user->id}, event {$event->id}: {$e->getMessage()}");
                    $this->logFailedEmail($user->id, $eventTypeKey);
                }
            }
        }

        return [
            'success' => true,
            'sent_count' => $totalSentCount,
            'message' => "Hoàn tất! Đã gửi thành công {$totalSentCount} email sự kiện ngày lễ.",
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
        
<<<<<<< HEAD
        if (!$user->tier_id) return null;
=======
        if (!$user->tier_id) return null;  
>>>>>>> f99c5b9042cb7ae13a73c724455054f9d112b29e

        $matchedTierConfig = collect($tiers)->firstWhere('tier_id', $user->tier_id);

        if (!$matchedTierConfig || empty($matchedTierConfig['voucherCode']) || $matchedTierConfig['status'] !== 'active') {
            return null; 
        }

<<<<<<< HEAD
        // TẠO MÃ ĐỘC QUYỀN CHO TỪNG USER (VD: Cấu hình là BD25 -> Mã tạo ra là BD25-U15)
        $couponCode = $matchedTierConfig['voucherCode'] . '-U' . $user->id;
        $existingCoupon = Coupon::where('code', $couponCode)->first();
=======
        $baseCode = $matchedTierConfig['voucherCode'];
        // Tạo mã độc nhất cho từng user theo năm (VD: TIERKC-U15-2026)
        $couponCode = $baseCode . '-U' . $user->id . '-' . $today->year;
>>>>>>> f99c5b9042cb7ae13a73c724455054f9d112b29e

        $validityDays = $matchedTierConfig['validity_days'] ?? 7;
        $requiredExpiration = $today->copy()->addDays($validityDays)->endOfDay();

<<<<<<< HEAD
        if ($existingCoupon) {
            // Cập nhật lại hạn sử dụng và reset lượt dùng nếu năm sau khách lại có sinh nhật
            if (!$existingCoupon->expires_at || $existingCoupon->expires_at->lt($requiredExpiration)) {
                $existingCoupon->expires_at = $requiredExpiration;
                $existingCoupon->usage_count = 0; 
                $existingCoupon->is_used = false;
                $existingCoupon->save();
=======
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
>>>>>>> f99c5b9042cb7ae13a73c724455054f9d112b29e
            }
            throw $e;
        }
<<<<<<< HEAD

        return Coupon::create([
            'type' => $matchedTierConfig['type'] ?? 'fixed',
            'name' => 'Quà tặng sinh nhật: ' . ($user->name ?? $user->fullName ?? 'Khách hàng'),
            'code' => $couponCode,
            'min_spend' => $matchedTierConfig['min_spend'] ?? 0,
            'value' => $matchedTierConfig['value'] ?? 0,
            'usage_limit' => $matchedTierConfig['usage_limit_per_user'] ?? 1, 
            'usage_limit_per_user' => $matchedTierConfig['usage_limit_per_user'] ?? 1,
            'usage_count' => 0,
            'status' => 'active',
            'expires_at' => $requiredExpiration, 
            'user_id' => $user->id, // CHỐT CHẶT QUYỀN SỞ HỮU CHO ĐÚNG USER NÀY
            'is_used' => false
        ]);
=======
>>>>>>> f99c5b9042cb7ae13a73c724455054f9d112b29e
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

    private function logFailedEmail(int $userId, string $eventType): void
    {
        EmailLog::create([
            'user_id' => $userId,
            'event_type' => $eventType,
            'sent_at' => now(),
            'status' => 'failed',
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