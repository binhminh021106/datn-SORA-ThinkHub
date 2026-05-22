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
        {email? : Email user can reset. Bo trong se reset user co sinh nhat hom nay}
        {--year= : Nam can reset, mac dinh la nam hien tai}
        {--all : Reset tat ca user trong nam, khong chi sinh nhat hom nay}
        {--keep-coupons : Chi xoa log, khong xoa voucher sinh nhat cu}';

    protected $description = 'Reset log email sinh nhat de co the gui/test lai voucher sinh nhat';

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
            $this->warn('Khong tim thay user phu hop de reset.');
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

            $this->info("Da xoa {$deletedLogs} log email sinh nhat nam {$year}.");
            if (!$this->option('keep-coupons')) {
                $this->info("Da xoa {$deletedCoupons} voucher sinh nhat cu lien quan.");
            }
        });

        $this->line('Danh sach user da reset:');
        foreach ($users as $user) {
            $this->line("- {$user->email}");
        }

        $this->info('Reset xong. Co the chay: php artisan emails:send-birthday');

        return self::SUCCESS;
    }
}
