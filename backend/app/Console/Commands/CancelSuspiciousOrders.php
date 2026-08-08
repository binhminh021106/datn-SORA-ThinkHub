<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\PendingOrderCancellationService;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CancelSuspiciousOrders extends Command
{
    protected $signature = 'orders:cancel-suspicious
        {--from= : Start datetime (required, for example "2026-08-03 09:00:00")}
        {--to= : End datetime (required, for example "2026-08-03 11:00:00")}
        {--user-id=* : Limit to one or more user IDs}
        {--chunk=100 : Number of orders processed per batch (1-500)}
        {--reason= : Required incident reason when executing}
        {--execute : Apply the cancellation; omitted means dry-run only}
        {--confirm= : Required value: cancel-suspicious-orders}';

    protected $description = 'Dry-run or safely cancel suspicious pending unpaid orders in a bounded time window.';

    public function handle(PendingOrderCancellationService $cancellationService): int
    {
        $range = $this->validatedRange();
        if (! $range) {
            return self::INVALID;
        }

        $chunk = max(1, min((int) $this->option('chunk'), 500));
        $query = Order::query()
            ->where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->whereBetween('created_at', $range)
            ->orderBy('id');

        $userIds = array_values(array_filter(array_map('intval', (array) $this->option('user-id'))));
        if ($userIds !== []) {
            $query->whereIn('user_id', $userIds);
        }

        $count = (clone $query)->count();
        $samples = (clone $query)->limit(20)->pluck('order_code')->all();

        $this->table(['Mục', 'Giá trị'], [
            ['Khoảng thời gian', $range[0]->toDateTimeString() . ' → ' . $range[1]->toDateTimeString()],
            ['Điều kiện', 'status=pending, payment_status=unpaid'],
            ['Số đơn khớp', (string) $count],
            ['Mẫu order code', $samples === [] ? '-' : implode(', ', $samples)],
        ]);

        if (! $this->option('execute')) {
            $this->warn('Dry-run: chưa có đơn hàng nào bị thay đổi. Dùng --execute, --reason và --confirm=cancel-suspicious-orders để thực hiện.');

            return self::SUCCESS;
        }

        $reason = trim((string) $this->option('reason'));
        if (mb_strlen($reason) < 5 || $this->option('confirm') !== 'cancel-suspicious-orders') {
            $this->error('Bị từ chối: cần --reason có ý nghĩa và --confirm=cancel-suspicious-orders.');

            return self::INVALID;
        }

        $cancelled = 0;
        $query->select('id', 'order_code')->lazyById($chunk)->each(function (Order $order) use ($cancellationService, $reason, &$cancelled) {
            $note = 'Hủy do incident chống spam: ' . $reason;

            if ($cancellationService->cancel($order->id, 'failed', $note)) {
                $cancelled++;
                $this->line("Đã hủy {$order->order_code}");
            }
        });

        $this->info("Hoàn tất: đã hủy an toàn {$cancelled}/{$count} đơn phù hợp.");

        return self::SUCCESS;
    }

    private function validatedRange(): ?array
    {
        if (trim((string) $this->option('from')) === '' || trim((string) $this->option('to')) === '') {
            $this->error('Cần cung cấp cả --from và --to.');

            return null;
        }

        try {
            $from = Carbon::parse((string) $this->option('from'));
            $to = Carbon::parse((string) $this->option('to'));
        } catch (\Throwable) {
            $this->error('Cần cung cấp --from và --to là datetime hợp lệ.');

            return null;
        }

        if ($to->lessThanOrEqualTo($from) || $from->diffInDays($to) > 31) {
            $this->error('Khoảng thời gian phải tăng dần và không vượt quá 31 ngày mỗi lần chạy.');

            return null;
        }

        return [$from, $to];
    }
}
