<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Coupon;
use App\Models\BirthdayEmailLog;
use App\Models\MembershipTier;
use App\Mail\BirthdayVoucherMail;
use App\Notifications\BirthdayVoucherNotification;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class SendBirthdayEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:send-birthday';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gửi email chúc mừng sinh nhật và voucher tự động cho khách hàng';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        
        // Lọc User có sinh nhật hôm nay và đã từng có đơn hàng (dựa vào accumulated_orders)
        $users = User::with('tier')
            ->whereMonth('birthday', $today->month)
            ->whereDay('birthday', $today->day)
            // ->where('accumulated_orders', '>', 0) // <-- TẠM TẮT ĐIỀU KIỆN NÀY ĐỂ BẠN DỄ TEST
            ->get();

        $count = 0;

        foreach ($users as $user) {
            if (!$this->isSilverTierOrAbove($user)) {
                $this->info("Bo qua {$user->email}: chua dat hang Bac tro len.");
                continue;
            }

            // Kiểm tra CHƯA được gửi mail sinh nhật trong năm nay
            $alreadySent = BirthdayEmailLog::where('user_id', $user->id)
                ->whereYear('sent_at', $today->year)
                ->where('status', 'success')
                ->exists();

            if ($alreadySent) {
                continue;
            }

            DB::beginTransaction();
            try {
                // Tạo Voucher: Sinh mã random, giảm giá 10-30%, hạn sử dụng 7 ngày
                $code = strtoupper(Str::random(8));
                while (Coupon::where('code', $code)->exists()) {
                    $code = strtoupper(Str::random(8));
                }

                $discountPercent = rand(10, 30);

                $coupon = Coupon::create([
                    'user_id' => $user->id,
                    'name' => 'Voucher Sinh Nhật ' . $today->year,
                    'code' => $code,
                    'min_spend' => 0,
                    'type' => 'birthday', // type varchar
                    'value' => $discountPercent,
                    'usage_limit' => 1,
                    'usage_count' => 0,
                    'usage_limit_per_user' => 1,
                    'expires_at' => Carbon::now()->addDays(7),
                    'is_used' => 0,
                    'status' => 'active'
                ]);

                // Gửi Email
                Mail::to($user->email)->send(new BirthdayVoucherMail($user, $coupon));

                // Gửi In-app Notification
                $user->notify(new BirthdayVoucherNotification($coupon));

                // Lưu trữ log thành công
                BirthdayEmailLog::create([
                    'user_id' => $user->id,
                    'coupon_id' => $coupon->id,
                    'email' => $user->email,
                    'sent_at' => Carbon::now(),
                    'status' => 'success',
                ]);

                DB::commit();
                $count++;
                $this->info("Đã gửi email sinh nhật cho: {$user->email}");

            } catch (\Exception $e) {
                DB::rollBack();
                // Lưu log thất bại
                BirthdayEmailLog::create([
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'sent_at' => Carbon::now(),
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);
                $this->error("Lỗi gửi email cho {$user->email}: " . $e->getMessage());
            }
        }

        $this->info("Hoàn tất. Đã gửi {$count} email sinh nhật hôm nay.");
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
