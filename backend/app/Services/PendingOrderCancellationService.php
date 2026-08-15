<?php

namespace App\Services;

use App\Events\ComboUpdated;
use App\Events\ProductUpdated;
use App\Models\Combo;
use App\Models\CommissionHistory;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\PaymentAttempt;
use App\Models\ProductVariant;
use App\Models\TierServiceUsage;
use Illuminate\Support\Facades\DB;

use Illuminate\Support\Facades\Log;

class PendingOrderCancellationService
{
    /**
     * Cancels only an unpaid pending order and reverses its checkout reservations.
     */
    public function cancel(
        int $orderId,
        string $paymentAttemptStatus,
        string $note,
        ?int $changedBy = null,
        string $changedByType = 'system'
    ): bool
    {
        try {
            $updates = DB::transaction(function () use ($orderId, $paymentAttemptStatus, $note, $changedBy, $changedByType) {
            $order = Order::with('items')
                ->whereKey($orderId)
                ->where('status', 'pending')
                ->where('payment_status', 'unpaid')
                ->lockForUpdate()
                ->first();

            if (! $order) {
                return null;
            }

            $order->update(['status' => 'cancelled', 'payment_status' => 'failed']);

            PaymentAttempt::where('order_id', $order->id)
                ->where('status', 'pending')
                ->update(['status' => $paymentAttemptStatus]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'old_status' => 'pending',
                'new_status' => 'cancelled',
                'note' => $note,
                'changed_by' => $changedBy,
                'changed_by_type' => $changedByType,
            ]);

            TierServiceUsage::where('order_id', $order->id)
                ->where('service_type', 'tier_discount')
                ->delete();

            $this->restoreCouponUsage($order);
            CommissionHistory::where('order_id', $order->id)
                ->where('status', 'pending')
                ->delete();

            $productIds = [];
            $comboIds = [];

            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    $variant = ProductVariant::whereKey($item->product_variant_id)->lockForUpdate()->first();
                    if ($variant) {
                        $variant->increment('stock_quantity', $item->quantity);
                        $productIds[] = $variant->product_id;
                    }

                    continue;
                }

                if (! $item->combo_id) {
                    continue;
                }

                $combo = Combo::with('items')->whereKey($item->combo_id)->lockForUpdate()->first();
                if (! $combo) {
                    continue;
                }

                $comboIds[] = $combo->id;
                if ($combo->usage_limit !== null) {
                    $combo->increment('usage_limit', $item->quantity);
                }

                if (is_array($item->combo_selections)) {
                    foreach ($item->combo_selections as $selection) {
                        $variantId = $selection['selected_variant_id'] ?? null;
                        if (! $variantId) {
                            continue;
                        }

                        $variant = ProductVariant::whereKey($variantId)->lockForUpdate()->first();
                        if ($variant) {
                            $variant->increment('stock_quantity', $item->quantity);
                            $productIds[] = $variant->product_id;
                        }
                    }
                }

                foreach ($combo->items as $comboItem) {
                    if (! $comboItem->product_variant_id) {
                        continue;
                    }

                    $variant = ProductVariant::whereKey($comboItem->product_variant_id)->lockForUpdate()->first();
                    if ($variant) {
                        $variant->increment('stock_quantity', $item->quantity * $comboItem->quantity);
                        $productIds[] = $variant->product_id;
                    }
                }
            }

            return [
                'product_ids' => array_unique($productIds),
                'combo_ids' => array_unique($comboIds),
            ];
        });
        } catch (\Throwable $exception) {
            Log::error('Order cancellation failed due to exception.', [
                'order_id' => $orderId,
                'exception' => $exception, // Pass exception directly to get stack trace
            ]);
            return false;
        }

        if ($updates === null) {
            $exists = Order::query()->whereKey($orderId)->exists();
            if ($exists) {
                Log::warning("Order cancellation skipped: Order #{$orderId} is no longer pending/unpaid.", [
                    'order_id' => $orderId,
                ]);
            } else {
                Log::warning("Order cancellation skipped: Order #{$orderId} not found.", [
                    'order_id' => $orderId,
                ]);
            }
            return false;
        }

        try {
            foreach ($updates['product_ids'] as $productId) {
                broadcast(new ProductUpdated($productId, ['action' => 'stock_updated']));
            }

            foreach ($updates['combo_ids'] as $comboId) {
                broadcast(new ComboUpdated($comboId, ['action' => 'stock_updated']));
            }
        } catch (\Throwable $exception) {
            Log::warning('Failed to broadcast stock update after order cancellation.', [
                'order_id' => $orderId,
                'error' => $exception->getMessage(),
            ]);
        }

        return true;
    }

    private function restoreCouponUsage(Order $order): void
    {
        if (! $order->coupon_id) {
            return;
        }

        $coupon = Coupon::withTrashed()->whereKey($order->coupon_id)->lockForUpdate()->first();
        if (! $coupon) {
            return;
        }

        $wasAtLimit = $coupon->usage_limit !== null && (int) $coupon->usage_count === (int) $coupon->usage_limit;

        if ((int) $coupon->usage_count > 0) {
            $coupon->decrement('usage_count');
            $coupon->refresh();
        }

        if ($wasAtLimit && (! $coupon->expires_at || $coupon->expires_at->isFuture())) {
            if ($coupon->trashed() && $coupon->user_id !== null) {
                $coupon->restore();
            }

            if ($coupon->status === 'inactive' && $coupon->user_id === null) {
                $coupon->status = 'active';
            }
        }

        $coupon->save();
    }
}
