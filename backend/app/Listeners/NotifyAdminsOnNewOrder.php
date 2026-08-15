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

        try {
            $admins = \App\Models\Admin::where('status', 'active')->get();
            if ($admins->isNotEmpty()) {
                \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\AdminAlertNotification(
                    'Đơn hàng mới',
                    "Có đơn hàng mới {$order->order_code} trị giá " . number_format($order->total_amount) . " VNĐ",
                    'info',
                    "/admin/order/{$order->order_code}"
                ));
            }
            Log::info("🔔 [Job Queue] Đã thông báo cho Admin: Có đơn hàng mới {$order->order_code} trị giá " . number_format($order->total_amount) . " VNĐ");
        } catch (\Exception $e) {
            Log::error("❌ [Job Queue] Lỗi thông báo Admin đơn hàng mới {$order->order_code}: " . $e->getMessage());
            throw $e;
        }
    }
}
