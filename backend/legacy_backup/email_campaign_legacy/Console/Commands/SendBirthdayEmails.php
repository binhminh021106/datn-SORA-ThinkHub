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

        // Cache silverTier ra ngoài vòng lặp: tránh query lặp lại N lần
        $silverTier = MembershipTier::orderBy('min_spent', 'asc')
            ->get()
            ->first(function ($tier) {
                $tierName = Str::lower(Str::ascii($tier->name ?? ''));
                return Str::contains($tierName, ['silver', 'bac']);
            });

        if (!$silverTier) {
            $this->error('Không tìm thấy hạng Bạc trong hệ thống. Dừng lệnh.');
            return;
        }

        // Lấy tất cả user có sinh nhật hôm nay để log ra terminal
        $allBirthdayUsers = User::with('tier');

        // Cache silverTier ra ngoài vòng lặp: tránh query lặp lại N lần
        $silverTier = MembershipTier::orderBy('min_spent', 'asc')
            ->get()
            ->first(function ($tier) {
                $tierName = Str::lower(Str::ascii($tier->name ?? ''));
                return Str::contains($tierName, ['silver', 'bac']);
            });

        if (!$silverTier) {
            $this->error('Không tìm thấy hạng Bạc trong hệ thống. Dừng lệnh.');
            return;
        }

        // Lấy tất cả user có sinh nhật hôm nay để log ra terminal
        $allBirthdayUsers = User::with('tier')
            ->whereMonth('birthday', $today->month)
            ->whereDay('birthday', $today->day)
            ->get();

        $count = 0;

        foreach ($allBirthdayUsers as $user) {
            // 1. Trạng thái tài khoản đang hoạt động
            if ($user->status !== 'active') {
                $this->warn("Bỏ qua {$user->email}: Trạng thái tài khoản không active.");
                continue;
            }
            // 2. Đã xác thực Email
            // if (is_null($user->email_verified_at)) {
            //     $this->warn("Bỏ qua {$user->email}: Chưa xác thực email.");
            //     continue;
            // }
            // 3. Có hoạt động trong 1 năm trở lại đây
            if ($user->updated_at < Carbon::now()->subYears(1)) {
                $this->warn("Bỏ qua {$user->email}: Không hoạt động trong 1 năm qua.");
                continue;
            }
            // Phải có ít nhất 1 đơn hàng thành công
            if ($user->accumulated_orders <= 0) {
                $this->warn("Bỏ qua {$user->email}: Chưa có đơn hàng nào.");
                continue;
            }

            // Dùng $silverTier đã được cache từ trước, không query lại
            if (!$user->tier_id || !$user->tier || (float)$user->tier->min_spent < (float)$silverTier->min_spent) {
                $this->warn("Bỏ qua {$user->email}: Chưa đạt hạng Bạc trở lên.");
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
                // Tạo Voucher: Sinh mã random, hạn sử dụng 7 ngày
                // Tạo Voucher: Sinh mã random, hạn sử dụng 7 ngày
                $code = strtoupper(Str::random(8));
                while (Coupon::where('code', $code)->exists()) {
                    $code = strtoupper(Str::random(8));
                }

                // 4. Mức giảm giá linh hoạt theo Hạng: bạc 5%, vàng 10%, kim cương 15%
                $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
                $tierName = Str::lower(Str::ascii($userTier->name ?? ''));
                
                $discountPercent = 5; // Mặc định hạng Bạc 5%
                if (Str::contains($tierName, ['kim cuong', 'diamond'])) {
                    $discountPercent = 15;
                } elseif (Str::contains($tierName, ['vang', 'gold'])) {
                    $discountPercent = 10;
                } elseif (Str::contains($tierName, ['bac', 'silver'])) {
                    $discountPercent = 5;
                }
                // 4. Mức giảm giá linh hoạt theo Hạng: bạc 5%, vàng 10%, kim cương 15%
                $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
                $tierName = Str::lower(Str::ascii($userTier->name ?? ''));
                
                $discountPercent = 5; // Mặc định hạng Bạc 5%
                if (Str::contains($tierName, ['kim cuong', 'diamond'])) {
                    $discountPercent = 15;
                } elseif (Str::contains($tierName, ['vang', 'gold'])) {
                    $discountPercent = 10;
                } elseif (Str::contains($tierName, ['bac', 'silver'])) {
                    $discountPercent = 5;
                }

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

                // Gửi Email ngay lập tức (đồng bộ)
                // Gửi Email ngay lập tức (đồng bộ)
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

    // Hàm isSilverTierOrAbove đã được tích hợp trực tiếp vào vòng lặp
    // sử dụng $silverTier đã được cache — không cần hàm riêng nữa
}