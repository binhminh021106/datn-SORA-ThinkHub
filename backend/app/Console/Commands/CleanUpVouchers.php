<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Coupon;

class CleanUpVouchers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'vouchers:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Tự động Tạm dừng voucher chung hết hạn và Xóa mềm voucher sinh nhật/cá nhân hết hạn';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Bắt đầu dọn dẹp voucher hết hạn...");

        // 1. Dọn dẹp Voucher chung (user_id IS NULL) -> Chuyển thành inactive (tạm dừng)
        $hiddenCount = Coupon::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNull('user_id')
            ->update(['status' => 'inactive']);

        if ($hiddenCount > 0) {
            $this->info("Đã chuyển {$hiddenCount} voucher chung hết hạn sang trạng thái tạm dừng (inactive).");
        }

        // 2. Dọn dẹp Voucher cá nhân/sinh nhật (user_id IS NOT NULL) -> Xóa mềm
        $deletedCount = Coupon::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNotNull('user_id')
            ->delete(); // Soft delete do Model có trait SoftDeletes

        if ($deletedCount > 0) {
            $this->info("Đã xóa mềm {$deletedCount} voucher cá nhân hết hạn.");
        }

        $this->info("Hoàn tất dọn dẹp voucher!");
    }
}
