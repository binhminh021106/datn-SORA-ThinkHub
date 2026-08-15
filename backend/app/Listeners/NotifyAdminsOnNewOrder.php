<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class NotifyAdminsOnNewOrder implements ShouldQueue
{
    use InteractsWithQueue;
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(OrderCreated $event): void
    {
        $order = $event->order;

        // TODO: Gửi Broadcast Notification hoặc lưu vào bảng Notifications cho Admin
        Log::info("🔔 [Job Queue] Thông báo cho Admin: Có đơn hàng mới {$order->order_code} trị giá " . number_format($order->total_amount) . " VNĐ");
    }
}
