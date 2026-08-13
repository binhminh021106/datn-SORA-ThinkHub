<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Services\PendingOrderCancellationService;

class CleanUpPendingOrders extends Command
{
    protected $signature = 'orders:cleanup';
    protected $description = 'Hủy các đơn pending/unpaid đã quá hạn thanh toán, giải phóng mã giảm giá và hoàn kho.';

    public function handle(PendingOrderCancellationService $cancellationService)
    {
        $this->info("Bắt đầu dọn dẹp đơn hàng hết hạn...");
        $attemptTtlMinutes = max(1, (int) config('payment.attempt_ttl_minutes', 15));

        $expiredOrders = Order::where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->whereIn('payment_method', ['momo', 'vnpay'])
            ->where('created_at', '<', now()->subMinutes($attemptTtlMinutes))
            ->select('id', 'order_code')
            ->lazyById(100);

        foreach ($expiredOrders as $order) {
            if ($cancellationService->cancel(
                $order->id,
                'expired',
                'Tự động hủy đơn chưa thanh toán đã hết hạn thanh toán.'
            )) {
                $this->info("Đã hủy đơn hàng {$order->order_code}");
            }
        }

        $this->info("Hoàn tất dọn dẹp đơn hàng!");
    }

}
