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

        try {
            \Illuminate\Support\Facades\Mail::to($order->customer_email)->send(new \App\Mail\OrderPlacedMail($order));
            Log::info("📨 [Job Queue] Đã gửi Email xác nhận cho đơn hàng: {$order->order_code} tới {$order->customer_email}");
        } catch (\Exception $e) {
            Log::error("❌ [Job Queue] Lỗi gửi Email xác nhận cho đơn hàng {$order->order_code}: " . $e->getMessage());
            throw $e;
        }
    }
}
