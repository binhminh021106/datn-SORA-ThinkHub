<?php

namespace App\Jobs;

use App\Mail\AdminNewOrderMail;
use App\Mail\OrderPlacedMail;
use App\Models\Admin;
use App\Models\Order;
use App\Services\ExpoPushNotificationService;
use App\Services\InAppNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendOrderSuccessNotificationsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $orderId)
    {
    }

    public function handle(
        InAppNotificationService $inAppNotificationService,
        ExpoPushNotificationService $pushNotificationService
    ): void {
        $order = Order::with('items')->find($this->orderId);

        if (!$order) {
            return;
        }

        $this->createInAppNotification($order, $inAppNotificationService);
        $this->queueEmails($order);
        $this->sendPushNotification($order, $pushNotificationService);
    }

    private function createInAppNotification(Order $order, InAppNotificationService $inAppNotificationService): void
    {
        $inAppNotificationService->createForUser(
            $order->user_id,
            'order_success',
            'Đặt hàng thành công',
            'Đơn hàng ' . $order->order_code . ' đã được SORA ghi nhận. Bạn có thể theo dõi trạng thái trong lịch sử đơn hàng.',
            'OrderHistory',
            [
                'order_code' => $order->order_code,
            ]
        );
    }

    private function queueEmails(Order $order): void
    {
        try {
            if (!empty($order->customer_email)) {
                Mail::to($order->customer_email)->queue(new OrderPlacedMail($order));
            }

            $adminEmailsToNotify = $this->resolveAdminOrderNotificationEmails();

            if (!empty($adminEmailsToNotify)) {
                Mail::to($adminEmailsToNotify)->queue(new AdminNewOrderMail($order));
            }
        } catch (\Throwable $e) {
            Log::error('Queue order email failed for ' . $order->order_code . ': ' . $e->getMessage());
        }
    }

    private function resolveAdminOrderNotificationEmails(): array
    {
        $adminEmailsEnv = env('ADMIN_ORDER_NOTIFICATION_EMAIL');

        if (!empty($adminEmailsEnv)) {
            return array_values(array_filter(array_map('trim', explode(',', $adminEmailsEnv))));
        }

        return Admin::where('role_id', 1)
            ->where('status', 'active')
            ->pluck('email')
            ->toArray();
    }

    private function sendPushNotification(Order $order, ExpoPushNotificationService $pushNotificationService): void
    {
        if (!$order->user_id) {
            return;
        }

        $pushNotificationService->sendToUser(
            $order->user_id,
            'SORA đã nhận đơn hàng',
            'Đơn hàng ' . $order->order_code . ' đã được đặt thành công.',
            [
                'screen' => 'OrderHistory',
                'order_code' => $order->order_code,
                'type' => 'order_success',
            ]
        );
    }
}
