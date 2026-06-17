<?php

namespace App\Console\Commands;

use App\Models\BirthdayEmailLog;
use App\Models\Coupon;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class ResetBirthdayEmails extends Command
{
    protected $signature = 'sora:reset-birthday-emails
        {email? : Email của user cần reset. Bỏ trống sẽ reset user có sinh nhật hôm nay}
        {--year= : Năm cần reset, mặc định là năm hiện tại}
        {--all : Reset tất cả user trong năm, không chỉ sinh nhật hôm nay}
        {--keep-coupons : Chỉ xóa log, không xóa voucher sinh nhật cũ}';

    protected $description = 'Reset log email sinh nhật để có thể gửi/test lại voucher sinh nhật';

    public function handle(): int
    {
        $today = Carbon::today();
        $year = (int) ($this->option('year') ?: $today->year);
        $email = $this->argument('email');

        $usersQuery = User::query();

        if ($email) {
            $usersQuery->where('email', $email);
        } elseif (!$this->option('all')) {
            $usersQuery->whereMonth('birthday', $today->month)
                ->whereDay('birthday', $today->day);
        }

        $users = $usersQuery->get(['id', 'email']);

        if ($users->isEmpty()) {
            $this->warn('Không tìm thấy user phù hợp để reset.');
            return self::SUCCESS;
        }

        $userIds = $users->pluck('id');

        DB::transaction(function () use ($year, $userIds) {
            $couponIds = BirthdayEmailLog::whereIn('user_id', $userIds)
                ->whereYear('sent_at', $year)
                ->whereNotNull('coupon_id')
                ->pluck('coupon_id');

            $deletedLogs = BirthdayEmailLog::whereIn('user_id', $userIds)
                ->whereYear('sent_at', $year)
                ->delete();

            $deletedCoupons = 0;
            if (!$this->option('keep-coupons') && $couponIds->isNotEmpty()) {
                $deletedCoupons = Coupon::whereIn('id', $couponIds)
                    ->where('type', 'birthday')
                    ->delete();
            }

            $this->info("Đã xóa {$deletedLogs} log email sinh nhật năm {$year}.");
            if (!$this->option('keep-coupons')) {
                $this->info("Đã xóa {$deletedCoupons} voucher sinh nhật cũ liên quan.");
            }
        });

        $this->line('Danh sách user đã reset:');
        foreach ($users as $user) {
            $this->line("- {$user->email}");
        }

        $this->info('Reset xong. Có thể chạy lệnh: php artisan emails:send-birthday');

        return self::SUCCESS;
    }
}