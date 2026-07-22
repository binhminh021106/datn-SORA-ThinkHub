<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Order;
use App\Models\ProductVariant;
use App\Models\Combo;
use App\Models\TierServiceUsage;
use App\Models\Coupon;
use Illuminate\Support\Facades\DB;

class CleanUpPendingOrders extends Command
{
    protected $signature = 'orders:cleanup';
    protected $description = 'Hủy các đơn hàng pending/unpaid đã quá thời gian 15 phút, giải phóng mã giảm giá và hoàn kho.';

    public function handle()
    {
        $this->info("Bắt đầu dọn dẹp đơn hàng hết hạn...");

        $expiredOrders = Order::with('items')->where('status', 'pending')
            ->where('payment_status', 'unpaid')
            ->where('created_at', '<', now()->subMinutes(15))
            ->get();

        foreach ($expiredOrders as $order) {
            $this->cancelOrderAndRestoreStock($order);
            $this->info("Đã hủy đơn hàng {$order->id}");
        }

        $this->info("Hoàn tất dọn dẹp đơn hàng!");
    }

    private function cancelOrderAndRestoreStock(Order $order): void
    {
        DB::transaction(function () use ($order) {
            // Re-query with lockForUpdate to prevent race conditions during cleanup
            $lockedOrder = Order::where('id', $order->id)
                ->where('status', 'pending')
                ->where('payment_status', 'unpaid')
                ->where('created_at', '<', now()->subMinutes(15))
                ->lockForUpdate()
                ->first();

            if (!$lockedOrder) {
                return; // Order was paid or processed concurrently
            }

            $lockedOrder->update(['status' => 'cancelled', 'payment_status' => 'failed']);

            TierServiceUsage::where('order_id', $order->id)
                ->where('service_type', 'tier_discount')
                ->delete();

            $this->restoreCouponUsage($order);
            \App\Models\CommissionHistory::where('order_id', $order->id)
                ->where('status', 'pending')
                ->delete();

            $updatedProductIds = [];
            $updatedComboIds = [];

            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    $variant = ProductVariant::find($item->product_variant_id);
                    if ($variant) {
                        $variant->increment('stock_quantity', $item->quantity);
                        $updatedProductIds[] = $variant->product_id;
                    }
                } elseif ($item->combo_id) {
                    $updatedComboIds[] = $item->combo_id;
                    Combo::where('id', $item->combo_id)
                        ->whereNotNull('usage_limit')
                        ->increment('usage_limit', $item->quantity);

                    if (is_array($item->combo_selections)) {
                        foreach ($item->combo_selections as $selection) {
                            $vId = $selection['selected_variant_id'] ?? null;
                            if ($vId) {
                                $variant = ProductVariant::find($vId);
                                if ($variant) {
                                    $variant->increment('stock_quantity', $item->quantity);
                                    $updatedProductIds[] = $variant->product_id;
                                }
                            }
                        }
                    }

                    $combo = Combo::with('items')->find($item->combo_id);
                    if ($combo) {
                        foreach ($combo->items as $cItem) {
                            if ($cItem->product_variant_id) {
                                $variant = ProductVariant::find($cItem->product_variant_id);
                                if ($variant) {
                                    $totalQtyToRestore = $item->quantity * $cItem->quantity;
                                    $variant->increment('stock_quantity', $totalQtyToRestore);
                                    $updatedProductIds[] = $variant->product_id;
                                }
                            }
                        }
                    }
                }
            }
            
            $this->broadcastStockUpdates($updatedProductIds, $updatedComboIds);
        });
    }

    private function broadcastStockUpdates(array $updatedProductIds, array $updatedComboIds): void
    {
        $uniqueProductIds = array_unique($updatedProductIds);
        foreach ($uniqueProductIds as $pid) {
            if ($pid) {
                broadcast(new \App\Events\ProductUpdated($pid, ['action' => 'stock_updated']));
            }
        }
        
        $uniqueComboIds = array_unique($updatedComboIds);
        foreach ($uniqueComboIds as $cid) {
            if ($cid) {
                broadcast(new \App\Events\ComboUpdated($cid, ['action' => 'stock_updated']));
            }
        }
    }

    private function restoreCouponUsage(Order $order): void
    {
        if (!$order->coupon_id) {
            return;
        }

        /** @var \App\Models\Coupon|null $coupon */
        $coupon = Coupon::withTrashed()->find($order->coupon_id);
        if (!$coupon) {
            return;
        }

        $wasAtLimit = ($coupon->usage_limit !== null && $coupon->usage_count == $coupon->usage_limit);

        if ((int) $coupon->usage_count > 0) {
            $coupon->decrement('usage_count');
            $coupon->refresh();
        }

        if ($wasAtLimit) {
            if (!$coupon->expires_at || $coupon->expires_at->isFuture()) {
                if ($coupon->trashed() && !is_null($coupon->user_id)) {
                    $coupon->restore();
                }
                if ($coupon->status === 'inactive' && is_null($coupon->user_id)) {
                    $coupon->status = 'active';
                }
            }
        }
        
        $coupon->save();
    }
}
