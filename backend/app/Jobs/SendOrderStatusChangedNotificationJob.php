<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\ExpoPushNotificationService;
use App\Services\InAppNotificationService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendOrderStatusChangedNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public int $orderId,
        public string $oldStatus,
        public string $newStatus
    ) {
    }

    public function handle(
        InAppNotificationService $inAppNotificationService,
        ExpoPushNotificationService $pushNotificationService
    ): void {
        $order = Order::find($this->orderId);

        if (!$order || !$order->user_id) {
            return;
        }

        $statusLabels = [
            'pending' => 'Chờ xác nhận',
            'confirmed' => 'Đã xác nhận',
            'processing' => 'Đang chuẩn bị',
            'shipping' => 'Đang giao hàng',
            'delivered' => 'Đã giao hàng',
            'cancelled' => 'Đã hủy',
            'return_requested' => 'Đang yêu cầu hoàn trả',
            'returned' => 'Đã hoàn trả',
        ];

        $oldLabel = $statusLabels[$this->oldStatus] ?? $this->oldStatus;
        $newLabel = $statusLabels[$this->newStatus] ?? $this->newStatus;
        $title = 'Đơn hàng ' . $order->order_code . ' đã cập nhật';
        $body = 'Trạng thái đơn hàng đã chuyển từ "' . $oldLabel . '" sang "' . $newLabel . '". Bạn có thể theo dõi chi tiết trong lịch sử đơn hàng.';
        $payload = [
            'type' => 'order_status',
            'screen' => 'OrderHistory',
            'order_code' => $order->order_code,
            'old_status' => $this->oldStatus,
            'new_status' => $this->newStatus,
        ];

        try {
            $inAppNotificationService->createForUser(
                $order->user_id,
                'order_status',
                $title,
                $body,
                'OrderHistory',
                $payload
            );

            $pushNotificationService->sendToUser(
                $order->user_id,
                $title,
                $body,
                $payload
            );
        } catch (\Throwable $e) {
            Log::warning('Order status notification job failed: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_code' => $order->order_code,
                'user_id' => $order->user_id,
                'old_status' => $this->oldStatus,
                'new_status' => $this->newStatus,
            ]);
        }
    }
}
