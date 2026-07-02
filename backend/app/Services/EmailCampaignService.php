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
   /**
     * Tạo hoặc lấy Voucher sinh nhật dựa trên cấu hình của Admin
     */
    private function createBirthdayCoupon(User $user, Carbon $today): ?Coupon
    {
        $setting = EmailCampaignSetting::current();
        $tiers = $setting->birthday_tiers ?? [];
        
        // 1. Xác định hạng hiện tại của User
        $userTierName = $this->getUserTierName($user);
        
        // 2. Tìm cấu hình quà tặng tương ứng
        $matchedTierConfig = collect($tiers)->first(function ($t) use ($userTierName) {
            return ($t['id'] ?? '') === $userTierName;
        });

        if (!$matchedTierConfig || empty($matchedTierConfig['voucherCode'])) {
            return null; 
        }

        // 3. TẠO MÃ ĐỘC QUYỀN CHO TỪNG KHÁCH HÀNG
        // Ghép thêm ID khách hàng và năm hiện tại (Ví dụ: BDAYGOLD-15-2026)
        $baseCode = $matchedTierConfig['voucherCode'];
        $uniqueCode = strtoupper($baseCode . '-' . $user->id . '-' . $today->year);

        // Kiểm tra xem năm nay khách này đã được tạo mã chưa
        $existingCoupon = Coupon::where('code', $uniqueCode)->first();

        if ($existingCoupon) {
            return $existingCoupon;
        }

        // 4. Khởi tạo mã Coupon mới với hạn sử dụng 24 giờ
        $rawDiscount = trim($matchedTierConfig['discount']);
        $lowerDiscount = mb_strtolower($rawDiscount, 'UTF-8');
        
        $isFreeship = str_contains($lowerDiscount, 'miễn phí') || str_contains($lowerDiscount, 'freeship');
        $isPercentage = str_contains($rawDiscount, '%');
        $numericValue = (float) preg_replace('/[^0-9.]/', '', $rawDiscount);

        if ($numericValue <= 0 && !$isFreeship) return null;

        return Coupon::create([
            'type' => $isFreeship ? 'freeship' : ($isPercentage ? 'percentage' : 'fixed'),
            'name' => 'Quà sinh nhật: ' . $user->name,
            'code' => $uniqueCode, // Lưu mã độc quyền vào DB
            'min_spend' => 0,
            'value' => $isFreeship ? 0 : $numericValue,
            'usage_count' => 0,
            'status' => 'active',
            'expires_at' => $today->copy()->addHours(24), // THIẾT LẬP HẠN DÙNG TRONG ĐÚNG 24 GIỜ
        ]);
    }

    /**
     * Phân loại nhanh tên hạng của User để match với cấu hình
     */
  /**
     * Phân loại hạng linh hoạt dựa trên Min Spent thay vì so khớp chuỗi Text.
     */
    private function getUserTierName(User $user): string
    {
        if (!$user->tier_id) return 'regular';
        
        $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        if (!$userTier) return 'regular';

        // Lấy danh sách hạng sắp xếp theo mức chi tiêu từ thấp đến cao
        $allTiers = MembershipTier::orderBy('min_spent', 'asc')->get();
        if ($allTiers->isEmpty()) return 'regular';

        // Tìm vị trí hạng của user trong danh sách
        $tierIndex = $allTiers->search(function ($tier) use ($userTier) {
            return $tier->id === $userTier->id;
        });

        if ($tierIndex === false) return 'regular';

        $totalTiers = $allTiers->count();
        
        // Quy chuẩn ánh xạ động (Top 1 là Diamond, Top 2 là Gold, còn lại là Silver)
        if ($tierIndex == $totalTiers - 1) return 'diamond';
        if ($tierIndex == $totalTiers - 2 && $totalTiers >= 2) return 'gold';
        if ($tierIndex >= 0) return 'silver';

        return 'regular';
    }

    private function isSilverTierOrAbove(User $user): bool
    {
        if (!$user->tier_id) return false;

        $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        if (!$userTier) return false;

        // Lấy mốc cấu hình của hạng cơ bản nhất (có id) để so sánh
        $silverTier = MembershipTier::orderBy('min_spent', 'asc')->first();
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