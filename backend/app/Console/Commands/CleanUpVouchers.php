<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Coupon;

class CleanUpVouchers extends Command
{
    // Tên lệnh
    protected $signature = 'vouchers:cleanup';

    // Mô tả lệnh
    protected $description = 'Tự động Tạm dừng voucher chung hết hạn và Xóa mềm voucher sinh nhật/cá nhân hết hạn';

    // Xử lý logic
    public function handle()
    {
        $this->info("Bắt đầu dọn dẹp voucher hết hạn...");

        // 1. Tạm dừng voucher chung hết hạn
        $hiddenCount = Coupon::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNull('user_id')
            ->update(['status' => 'inactive']);

        if ($hiddenCount > 0) {
            $this->info("Đã chuyển {$hiddenCount} voucher chung hết hạn sang trạng thái tạm dừng (inactive).");
        }

        // 2. Xóa mềm voucher cá nhân hết hạn
        $deletedCount = Coupon::where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->whereNotNull('user_id')
            ->delete();

        if ($deletedCount > 0) {
            $this->info("Đã xóa mềm {$deletedCount} voucher cá nhân hết hạn.");
        }

        $this->info("Hoàn tất dọn dẹp voucher!");
    }
}
