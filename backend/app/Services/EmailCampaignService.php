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
    private string $birthdayColumn = 'birthday'; 
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

            try {
                $coupon = $this->createBirthdayCoupon($user, $today);

                if (!$coupon) {
                    $skippedCount++;
                    continue; 
                }

                try {
                    $emailLog = EmailLog::create([
                        'user_id' => $user->id,
                        'event_type' => 'birthday',
                        'campaign_year' => $preventDuplicateSends ? $today->year : null,
                        'queued_at' => now(),
                        'status' => 'queued',
                        'voucher_code' => $coupon->code,
                        'action_url' => $this->shopCouponUrl($coupon->code),
                    ]);
                } catch (\Illuminate\Database\QueryException $e) {
                    if ($e->getCode() == 23000) {
                        $existingLog = EmailLog::where('user_id', $user->id)
                            ->where('event_type', 'birthday')
                            ->when($preventDuplicateSends, fn($q) => $q->where('campaign_year', $today->year), fn($q) => $q->whereNull('campaign_year'))
                            ->first();

                        if ($existingLog && in_array($existingLog->status, ['queued', 'sent'])) {
                            $skippedCount++;
                            continue;
                        }

                        if ($existingLog) {
                            $existingLog->update([
                                'status' => 'queued',
                                'voucher_code' => $coupon->code,
                                'action_url' => $this->shopCouponUrl($coupon->code),
                                'queued_at' => now(),
                                'error_message' => null
                            ]);
                            $emailLog = $existingLog;
                        } else {
                            throw $e;
                        }
                    } else {
                        throw $e;
                    }
                }

                Mail::to($user->email)->queue(new BirthdayVoucherMail($user, $coupon, $emailLog->id));
                $queuedCount++;
            } catch (\Throwable $e) {
                Log::error("Birthday campaign mail failed for user {$user->id}: {$e->getMessage()}");
                $failedCount++;
                if (isset($emailLog)) {
                    $emailLog->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                } else {
                    $this->logFailedEmail($user->id, 'birthday', $e->getMessage(), $preventDuplicateSends ? $today->year : null);
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

            // Tối ưu hiệu suất: Kiểm tra trạng thái sự kiện 1 lần duy nhất cho toàn bộ tập người dùng
            $eventStillSendable = HolidayEvent::whereKey($event->id)
                ->where('status', 'active')
                ->where('event_date', $todayStr)
                ->exists();

            if (!$eventStillSendable) {
                continue; // Bỏ qua sự kiện nếu đã bị tắt
            }

            // AUTO-EXTEND VOUCHER VALIDITY (Gia hạn mã tự động cho năm nay)
            if ($targetUsers->isNotEmpty() && $event->voucher_code && $event->validity_days && $event->event_date) {
                try {
                    $eventDateObj = Carbon::createFromFormat('d/m/Y', $event->event_date . '/' . now()->year)->startOfDay();
                    if ($eventDateObj->copy()->addDays($event->validity_days)->endOfDay()->isPast()) {
                        $eventDateObj->addYear();
                    }
                    $expiresAt = $eventDateObj->addDays($event->validity_days)->endOfDay();
                } catch (\Exception $e) {
                    $expiresAt = null;
                }

                \App\Models\Coupon::where('code', $event->voucher_code)
                    ->update([
                        'expires_at' => $expiresAt,
                    ]);
            }

            foreach ($targetUsers as $user) {
                $emailLog = null;

                try {
                    try {
                        $emailLog = EmailLog::create([
                            'user_id' => $user->id,
                            'event_type' => $eventTypeKey,
                            'campaign_year' => $preventDuplicateSends ? $today->year : null,
                            'queued_at' => now(),
                            'status' => 'queued',
                            'voucher_code' => $event->voucher_code,
                            'action_url' => $event->voucher_code ? $this->shopCouponUrl($event->voucher_code) : $this->shopUrl(),
                        ]);
                    } catch (\Illuminate\Database\QueryException $e) {
                        if ($e->getCode() == 23000) {
                            $existingLog = EmailLog::where('user_id', $user->id)
                                ->where('event_type', $eventTypeKey)
                                ->when($preventDuplicateSends, fn($q) => $q->where('campaign_year', $today->year), fn($q) => $q->whereNull('campaign_year'))
                                ->first();

                            if ($existingLog && in_array($existingLog->status, ['queued', 'sent'])) {
                                continue; // Đã gửi trong năm nay
                            }

                            if ($existingLog) {
                                $existingLog->update([
                                    'status' => 'queued',
                                    'voucher_code' => $event->voucher_code,
                                    'action_url' => $event->voucher_code ? $this->shopCouponUrl($event->voucher_code) : $this->shopUrl(),
                                    'queued_at' => now(),
                                    'error_message' => null
                                ]);
                                $emailLog = $existingLog;
                            } else {
                                throw $e;
                            }
                        } else {
                            throw $e;
                        }
                    }

                    Mail::to($user->email)->queue(new HolidayCouponMail($user, $event, null, $emailLog->id));
                    $totalQueuedCount++;
            } catch (\Throwable $e) {
                    Log::error("Holiday campaign mail failed for user {$user->id}, event {$event->id}: {$e->getMessage()}");
                    $totalFailedCount++;
                    if (isset($emailLog)) {
                        $emailLog->update(['status' => 'failed', 'error_message' => $e->getMessage()]);
                    } else {
                        $this->logFailedEmail($user->id, $eventTypeKey, $e->getMessage(), $preventDuplicateSends ? $today->year : null);
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

  private function createBirthdayCoupon(User $user, Carbon $today): ?Coupon
    {
        $setting = EmailCampaignSetting::current();
        $tiers = $setting->birthday_tiers ?? [];

        $tiers = array_map(function ($t) {
            $t['tier_id'] = $t['tier_id'] ?? $t['id'] ?? null;
            $t['type'] = $t['type'] ?? 'fixed';
            $t['value'] = $t['value'] ?? $t['discount'] ?? 0;
            return $t;
        }, $tiers);
        
        if (!$user->tier_id) {
            // Lấy cấu hình của Khách thường (tier_id = 0)
            $matchedTierConfig = collect($tiers)->first(function($t) {
                return isset($t['tier_id']) && (int) $t['tier_id'] === 0;
            });
            
            if (!$matchedTierConfig) {
                \Illuminate\Support\Facades\Log::warning("EmailCampaignService: Skipped user {$user->id} because no tier config available for fallback.");
                return null;  
            }
        } else {
            $matchedTierConfig = collect($tiers)->first(function($t) use ($user) {
                return isset($t['tier_id']) && (int) $t['tier_id'] === (int) $user->tier_id;
            });
        }

        if (!$matchedTierConfig) {
            \Illuminate\Support\Facades\Log::warning("EmailCampaignService: Skipped user {$user->id} because no tier config found for tier_id {$user->tier_id}", ['tiers' => $tiers]);
            return null;
        }

        if (empty($matchedTierConfig['voucherCode'])) {
            \Illuminate\Support\Facades\Log::warning("EmailCampaignService: Skipped user {$user->id} because voucherCode is empty for tier_id " . ($matchedTierConfig['tier_id'] ?? 'unknown'), ['config' => $matchedTierConfig]);
            return null;
        }

        $tierStatus = $matchedTierConfig['status'] ?? 'active';
        if ($tierStatus !== 'active') {
            \Illuminate\Support\Facades\Log::warning("EmailCampaignService: Skipped user {$user->id} because tier status is not active for tier_id " . ($matchedTierConfig['tier_id'] ?? 'unknown'), ['config' => $matchedTierConfig]);
            return null; 
        }

        $baseCode = $matchedTierConfig['voucherCode'];
        // Tạo mã độc nhất cho từng user theo năm
        $couponCode = $baseCode . '-U' . $user->id . '-' . $today->year;

        $validityDays = $matchedTierConfig['validity_days'] ?? 7;
        $requiredExpiration = $today->copy()->addDays($validityDays)->endOfDay();

        try {
            return Coupon::firstOrCreate(
                ['code' => $couponCode],
                [
                    'type' => $matchedTierConfig['type'] ?? 'fixed',
                    'name' => 'Quà tặng sinh nhật hạng: ' . ($matchedTierConfig['name'] ?? 'Cơ bản'),
                    'min_spend' => $matchedTierConfig['min_spend'] ?? 0,
                    'value' => $matchedTierConfig['value'] ?? 0,
                    'usage_limit' => $matchedTierConfig['usage_limit'] ?? null,
                    'usage_limit_per_user' => $matchedTierConfig['usage_limit_per_user'] ?? 1,
                    'usage_count' => 0,
                    'status' => $tierStatus,
                    'expires_at' => $requiredExpiration, 
                    'user_id' => $user->id, 
                    'tier_id' => $user->tier_id,
                    'is_used' => false
                ]
            );
        } catch (\Illuminate\Database\QueryException $e) {
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

        $silverTier = MembershipTier::orderBy('min_spent', 'asc')->skip(1)->first();
        if (!$silverTier) return false;

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

    private function logFailedEmail(int $userId, string $eventType, ?string $errorMessage = null, ?int $campaignYear = null): void
    {
        EmailLog::create([
            'user_id' => $userId,
            'event_type' => $eventType,
            'campaign_year' => $campaignYear,
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
