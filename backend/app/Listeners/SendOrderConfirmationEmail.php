<?php

namespace App\Listeners;

use App\Events\OrderCreated;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Log;

class SendOrderConfirmationEmail implements ShouldQueue
{
    use InteractsWithQueue;

    public $queue = 'emails'; // Push to emails queue
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

        // TODO: Thực tế sẽ gọi Mail::to($order->customer_email)->send(new OrderConfirmationMail($order));
        // Hiện tại chỉ log lại để minh họa
        Log::info("📨 [Job Queue] Đã gửi Email xác nhận cho đơn hàng: {$order->order_code} tới {$order->customer_email}");
    }
}
