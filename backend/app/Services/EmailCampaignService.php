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
use App\Services\AudienceFilterService; // Import Service lọc người dùng mới
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
                'message' => 'Email sinh nhat tu dong dang tat.',
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
                'message' => 'Hom nay khong co khach hang nao sinh nhat.',
            ];
        }

        $sentCount = 0;

        foreach ($birthdayUsers as $user) {
            $user = User::with('tier')
                ->whereKey($user->id)
                ->whereMonth($this->birthdayColumn, $today->month)
                ->whereDay($this->birthdayColumn, $today->day)
                ->whereNotNull('email')
                ->first();

            if (!$user) {
                continue;
            }

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
                if (!$this->isSilverTierOrAbove($user)) {
                    continue;
                }

                $coupon = $this->createBirthdayCoupon($user, $today);

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
            'message' => "Hoan tat! Da gui thanh cong {$sentCount} email sinh nhat.",
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
                'message' => 'Hom nay khong co su kien ngay le nao duoc cai dat.',
            ];
        }

        $totalSentCount = 0;
        
        // Khởi tạo Service bộ lọc mảng từ Canvas
        $audienceService = new AudienceFilterService();

        foreach ($eventsToday as $event) {
            $event = HolidayEvent::whereKey($event->id)
                ->where('status', 'active')
                ->where('event_date', $todayStr)
                ->first();

            if (!$event) {
                continue;
            }

            // Lấy dữ liệu nguyên gốc từ Database để xử lý an toàn
            $rawTarget = $event->getRawOriginal('target_audience');
            $targets = [];

            if (!empty($rawTarget)) {
                $decoded = json_decode($rawTarget, true);
                // Nếu parse JSON thành công và là mảng (Dữ liệu sự kiện tạo mới)
                if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                    $targets = $decoded;
                } else {
                    // Nếu lỗi parse JSON -> Đây là dữ liệu sự kiện cũ lưu dạng chữ (VD: "male", "gold")
                    $targets = [$rawTarget];
                }
            } elseif (is_array($event->target_audience)) {
                $targets = $event->target_audience;
            }

            // Chắc chắn mảng không có giá trị rỗng 
            $targets = array_filter($targets);
            if (empty($targets)) {
                $targets = ['all'];
            }

            // Gọi AudienceFilterService để quét danh sách Users
            $targetUsers = $audienceService->getTargetedUsers($targets);
            
            // Tải thêm thông tin Hạng thành viên (tier) để Mail template sử dụng (tránh N+1 query)
            $targetUsers->load('tier');

            $eventTypeKey = 'holiday_' . $event->id;

            foreach ($targetUsers as $user) {
                $eventStillSendable = HolidayEvent::whereKey($event->id)
                    ->where('status', 'active')
                    ->where('event_date', $todayStr)
                    ->exists();

                if (!$eventStillSendable) {
                    break;
                }

                if ($preventDuplicateSends) {
                    $alreadySent = EmailLog::where('user_id', $user->id)
                        ->where('event_type', $eventTypeKey)
                        ->where('status', 'success')
                        ->whereYear('sent_at', $today->year)
                        ->exists();

                    if ($alreadySent) {
                        continue;
                    }
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
            'message' => "Hoan tat! Da gui thanh cong {$totalSentCount} email su kien ngay le.",
        ];
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

    private function createBirthdayCoupon(User $user, Carbon $today): Coupon
    {
        return Coupon::create([
            'user_id' => $user->id,
            'type' => 'birthday',
            'name' => 'Voucher Sinh Nhat ' . $today->year,
            'code' => $this->generateBirthdayCouponCode($user, $today),
            'min_spend' => 0,
            'value' => $this->birthdayDiscountPercent($user),
            'usage_limit' => 1,
            'usage_count' => 0,
            'usage_limit_per_user' => 1,
            'expires_at' => $today->copy()->addDays(7)->endOfDay(),
            'is_used' => 0,
            'status' => 'active',
        ]);
    }

    private function generateBirthdayCouponCode(User $user, Carbon $today): string
    {
        do {
            $code = 'BDAY' . $today->format('y') . strtoupper(Str::random(4)) . $user->id;
        } while (Coupon::withTrashed()->where('code', $code)->exists());

        return $code;
    }

    private function birthdayDiscountPercent(User $user): int
    {
        $tier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        $tierName = Str::lower(Str::ascii($tier->name ?? ''));

        if (Str::contains($tierName, ['kim cuong', 'diamond'])) {
            return 15;
        }

        if (Str::contains($tierName, ['vang', 'gold'])) {
            return 10;
        }

        return 5;
    }

    private function isSilverTierOrAbove(User $user): bool
    {
        if (!$user->tier_id) {
            return false;
        }

        $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        if (!$userTier) {
            return false;
        }

        $silverTier = MembershipTier::orderBy('min_spent', 'asc')
            ->get()
            ->first(function ($tier) {
                $tierName = Str::lower(Str::ascii($tier->name ?? ''));
                return Str::contains($tierName, ['silver', 'bac']);
            });

        if (!$silverTier) {
            return false;
        }

        return (float) $userTier->min_spent >= (float) $silverTier->min_spent;
    }
}