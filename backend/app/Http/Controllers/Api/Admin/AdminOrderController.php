<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\ProductVariant;
use App\Models\Combo;
use App\Models\User;
use App\Models\MembershipTier;
use App\Models\TierHistory;
use App\Models\TierServiceUsage;
use App\Http\Requests\Admin\Order\AdminUpdateOrderRequest;
use App\Jobs\SendOrderStatusChangedNotificationJob;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\OrderRefundDealMail;
use App\Events\AdminRefresh;
use Illuminate\Support\Facades\Log;

class AdminOrderController extends Controller
{
    private function broadcastUpdate($message = 'Có cập nhật mới về đơn hàng!')
    {
        try {
            broadcast(new AdminRefresh('orders', $message, now()->toDateTimeString()));
        } catch (\Exception $e) {
            Log::error("Broadcast Reverb thất bại: " . $e->getMessage());
        }
    }

    public function index(Request $request)
    {
        $baseQuery = Order::query();

        // Lọc theo ngày
        if ($request->filled('start_date')) {
            $baseQuery->where('created_at', '>=', $request->start_date . ' 00:00:00');
        }
        if ($request->filled('end_date')) {
            $baseQuery->where('created_at', '<=', $request->end_date . ' 23:59:59');
        }

        // Lọc theo trạng thái thanh toán
        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $baseQuery->where('payment_status', $request->payment_status);
        }

        // Tìm kiếm
        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $baseQuery->where(function ($q) use ($searchTerm) {
                $q->where('order_code', 'like', "%{$searchTerm}%")
                    ->orWhere('customer_name', 'like', "%{$searchTerm}%")
                    ->orWhere('customer_phone', 'like', "%{$searchTerm}%");
            });
        }

        // Xử lý đếm và lọc trang Hoàn trả (Returns)
        if ($request->boolean('is_return_page')) {
            $baseQuery->where(function ($q) {
                $q->whereIn('status', ['returned', 'return_requested', 'return_negotiating', 'return_retrieving'])
                    ->orWhere(function ($sub) {
                        $sub->where('status', 'cancelled')->whereIn('payment_status', ['paid', 'refunded']);
                    })
                    ->orWhere(function ($sub) {
                        $sub->where('status', 'delivered')->whereNotNull('refund_amount')->where('refund_amount', 0);
                    });
            });

            // [TỐI ƯU ORM 1] Thay vì get() toàn bộ, sử dụng Aggregation ở cấp DB để chạy siêu tốc cho Tanstack Query
            $returnStats = (clone $baseQuery)->select(
                DB::raw('COUNT(*) as total_all'),
                DB::raw('SUM(CASE WHEN status = "return_requested" THEN 1 ELSE 0 END) as total_pending'),
                DB::raw('SUM(CASE WHEN status IN ("return_negotiating", "return_retrieving") THEN 1 ELSE 0 END) as total_proposing'),
                DB::raw('SUM(CASE WHEN status = "returned" THEN 1 ELSE 0 END) as total_refunded'),
                DB::raw('SUM(CASE WHEN status = "delivered" AND refund_amount = 0 THEN 1 ELSE 0 END) as total_rejected'),
                DB::raw('SUM(CASE WHEN status = "cancelled" AND payment_status IN ("paid", "refunded") THEN 1 ELSE 0 END) as total_cancelled')
            )->first();

            $counts = [
                'all'       => (int) ($returnStats->total_all ?? 0),
                'pending'   => (int) ($returnStats->total_pending ?? 0),
                'proposing' => (int) ($returnStats->total_proposing ?? 0),
                'refunded'  => (int) ($returnStats->total_refunded ?? 0),
                'rejected'  => (int) ($returnStats->total_rejected ?? 0),
                'cancelled' => (int) ($returnStats->total_cancelled ?? 0),
            ];

            // Lọc theo tab Hoàn trả
            if ($request->filled('return_tab') && $request->return_tab !== 'all') {
                $tab = $request->return_tab;
                if ($tab === 'pending') {
                    $baseQuery->where('status', 'return_requested');
                } elseif ($tab === 'proposing') {
                    $baseQuery->whereIn('status', ['return_negotiating', 'return_retrieving']);
                } elseif ($tab === 'refunded') {
                    $baseQuery->where('status', 'returned');
                } elseif ($tab === 'rejected') {
                    $baseQuery->where('status', 'delivered')->whereNotNull('refund_amount')->where('refund_amount', 0);
                } elseif ($tab === 'cancelled') {
                    $baseQuery->where('status', 'cancelled')->whereIn('payment_status', ['paid', 'refunded']);
                }
            }
        }
        // Xử lý đếm và lọc trang Đơn hàng tiêu chuẩn
        else {
            // [TỐI ƯU ORM 2] Gom cụm GroupBy
            $rawCounts = (clone $baseQuery)->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

            $counts = [
                'all'        => array_sum($rawCounts) 
                                - ($rawCounts['returned'] ?? 0) 
                                - ($rawCounts['return_requested'] ?? 0)
                                - ($rawCounts['return_negotiating'] ?? 0)
                                - ($rawCounts['return_retrieving'] ?? 0),
                'pending'    => $rawCounts['pending'] ?? 0,
                'confirmed'  => $rawCounts['confirmed'] ?? 0,
                'processing' => $rawCounts['processing'] ?? 0,
                'shipping'   => $rawCounts['shipping'] ?? 0,
                'delivered'  => $rawCounts['delivered'] ?? 0,
                'cancelled'  => $rawCounts['cancelled'] ?? 0,
                'returned'   => $rawCounts['returned'] ?? 0,
            ];

            if ($request->filled('status') && $request->status !== 'all') {
                $baseQuery->where('status', $request->status);
            } else {
                $baseQuery->whereNotIn('status', ['returned', 'return_requested', 'return_negotiating', 'return_retrieving']);
            }
        }

        $sortCol = $request->boolean('is_return_page') ? 'updated_at' : 'id';

        // [TỐI ƯU ORM 3] Eager Loading Pagination
        $orders = $baseQuery->with(['user:id,fullName,email'])
            ->withCount('items')
            ->orderBy($sortCol, 'desc')
            ->paginate(10);

        $this->enrichComboSelections($orders->getCollection());

        return response()->json([
            'success' => true,
            'data'    => $orders,
            'counts'  => $counts
        ]);
    }

    public function show($id)
    {
        $order = Order::with([
            'user:id,fullName,email,phone',
            'items.product:id,slug',
            'histories.changer:id,fullName'
        ])->findOrFail($id);

        $this->enrichComboSelections($order);

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function invoice($id)
    {
        $order = Order::with(['items'])->findOrFail($id);

        $pdf = Pdf::loadView('invoices.order', compact('order'));
        $pdf->setPaper('A4');
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled'      => true,
            'defaultFont'          => 'DejaVu Sans',
        ]);

        return $pdf->download("hoa-don-{$order->order_code}.pdf");
    }

    /**
     * [TỐI ƯU ORM 4] Dọn sạch N+1 Query và Gom nhóm increment
     */
    private function restoreOrderResources(Order $order)
    {
        // 1. HOÀN LẠI LƯỢT DÙNG ĐẶC QUYỀN HẠNG THÀNH VIÊN
        TierServiceUsage::where('order_id', $order->id)
            ->where('service_type', 'tier_discount')
            ->delete();

        // Khai báo bộ nạp Eager Loading để ngăn loop query
        $comboIds = $order->items->whereNotNull('combo_id')->pluck('combo_id')->unique();
        $combos = $comboIds->isNotEmpty() ? Combo::with('items')->whereIn('id', $comboIds)->get()->keyBy('id') : collect();

        // Bộ đệm Gom nhóm Variant ID tránh lặp query
        $variantIncrements = [];
        $comboUsageIncrements = [];

        // 2. PHÂN TÍCH NHÓM LƯỢNG TRẢ LẠI
        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                $variantIncrements[$item->product_variant_id] = ($variantIncrements[$item->product_variant_id] ?? 0) + $item->quantity;
            } elseif ($item->combo_id) {
                $comboUsageIncrements[$item->combo_id] = ($comboUsageIncrements[$item->combo_id] ?? 0) + $item->quantity;

                // Selection trong combo
                if (is_array($item->combo_selections)) {
                    foreach ($item->combo_selections as $selection) {
                        $vId = $selection['selected_variant_id'] ?? null;
                        if ($vId) {
                            $variantIncrements[$vId] = ($variantIncrements[$vId] ?? 0) + $item->quantity;
                        }
                    }
                }

                // Cố định trong combo
                $combo = $combos->get($item->combo_id);
                if ($combo) {
                    foreach ($combo->items as $cItem) {
                        if ($cItem->product_variant_id) {
                            $totalQtyToRestore = $item->quantity * $cItem->quantity;
                            $variantIncrements[$cItem->product_variant_id] = ($variantIncrements[$cItem->product_variant_id] ?? 0) + $totalQtyToRestore;
                        }
                    }
                }
            }
        }

        // 3. THỰC THI CHỈ MỘT VÒNG LẶP DUY NHẤT LÊN DB
        foreach ($variantIncrements as $vId => $qty) {
            ProductVariant::where('id', $vId)->increment('stock_quantity', $qty);
        }

        foreach ($comboUsageIncrements as $cId => $qty) {
            Combo::where('id', $cId)->whereNotNull('usage_limit')->increment('usage_limit', $qty);
        }
    }


    // Xử lý vòng đời Hoa Hồng Affiliate

    private function handleAffiliateCommission(Order $order, $newStatus)
    {
        if (!$order->affiliate_user_id) return;

        $commission = \App\Models\CommissionHistory::where('order_id', $order->id)->first();
        if (!$commission) return;

        // Kịch bản 1: Giao hàng thành công -> Duyệt hoa hồng
        if ($newStatus === 'delivered' && $commission->status === 'pending') {
            $commission->update(['status' => 'approved']);
            User::where('id', $order->affiliate_user_id)->increment('commission_balance', $commission->amount);
        } 
        // Kịch bản 2: Đơn bị Hủy hoặc Trả hàng
        elseif (in_array($newStatus, ['cancelled', 'returned'])) {
            if ($commission->status === 'pending') {
                $commission->update(['status' => 'rejected']);
            } elseif ($commission->status === 'approved') {
                $commission->update(['status' => 'rejected']);
                User::where('id', $order->affiliate_user_id)->decrement('commission_balance', $commission->amount);
            }
        }
    }

    public function updateStatus(AdminUpdateOrderRequest $request, $id)
    {
        DB::beginTransaction();
        try {
            $order = Order::with('items')->findOrFail($id);
            $oldStatus = $order->status;
            $newStatus = $request->status;
            $newPaymentStatus = $request->payment_status;
            $hasChanged = false;
            $statusChanged = $oldStatus !== $newStatus;

            if ($statusChanged) {
                $order->status = $newStatus;
                $hasChanged = true;

                // Tự động hóa thanh toán cho COD khi giao thành công
                if ($newStatus === 'delivered' && strtoupper($order->payment_method) === 'COD') {
                    $newPaymentStatus = 'paid';
                }

                OrderStatusHistory::create([
                    'order_id'        => $order->id,
                    'old_status'      => $oldStatus,
                    'new_status'      => $newStatus,
                    'note'            => $request->note,
                    'changed_by'      => Auth::id(),
                    'changed_by_type' => 'admin'
                ]);

                // Xử lý tự động duyệt/hủy tiền hoa hồng Affiliate
                $this->handleAffiliateCommission($order, $newStatus);

                // Hoàn kho nếu đang giao mà Hủy hoặc Trả hàng
                if (in_array($newStatus, ['cancelled', 'returned']) && !in_array($oldStatus, ['cancelled', 'returned'])) {
                    $this->restoreOrderResources($order);
                }
            }

            if ($order->payment_status !== $newPaymentStatus) {
                $order->payment_status = $newPaymentStatus;
                $hasChanged = true;
            }

            if ($hasChanged) {
                $order->save();
            }

            DB::commit();
            
            // Xử lý Hạng chỉ cho các case đã xác nhận kết thúc đơn
            if ($order->user_id && in_array($newStatus, ['delivered', 'cancelled', 'returned'])) {
                $this->checkAndUpgradeUserTier($order->user_id);
            }

            if ($statusChanged) {
                $this->notifyOrderStatusChanged($order, $oldStatus, $newStatus);
            }
            
            $this->broadcastUpdate("Trạng thái đơn hàng #{$order->order_code} vừa được cập nhật!");

            return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái đơn hàng thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
    }

    private function notifyOrderStatusChanged(Order $order, string $oldStatus, string $newStatus): void
    {
        if (!$order->user_id) {
            return;
        }

        SendOrderStatusChangedNotificationJob::dispatch($order->id, $oldStatus, $newStatus);
    }

    public function processRefundAction(Request $request, $id)
    {
        $request->validate([
            'action' => 'required|in:propose,reject,refunded',
            'refund_amount' => 'required|numeric|min:0',
            'refund_note' => 'nullable|string' 
        ]);

        DB::beginTransaction();
        try {
            // [TỐI ƯU ORM] Eager load items sẵn để hàm restore hoạt động mượt mà
            $order = Order::with('items')->findOrFail($id);
            $refundOldStatus = $order->status;
            $refundStatusChanged = false;

            $order->refund_amount = $request->action === 'reject' ? 0 : $request->refund_amount;
            if ($request->action === 'reject') {
                $order->refund_note = 'ADMIN: ' . ($request->refund_note ?: 'SORA từ chối hoàn trả');
            } else {
                $order->refund_note = $request->refund_note;
            }

            if ($request->action === 'refunded') {
                $order->payment_status = 'refunded';
                if ($order->status !== 'returned') {
                    $oldStatus = $order->status;
                    $order->status = 'returned'; 
                    $refundStatusChanged = true;
                    
                    // Thu hồi hoa hồng vì đơn hoàn trả
                    $this->handleAffiliateCommission($order, 'returned');
                    
                    if (!in_array($oldStatus, ['cancelled', 'returned'])) {
                        $this->restoreOrderResources($order);
                    }
                } else {
                    $oldStatus = $order->status;
                }

                OrderStatusHistory::query()->create([
                    'order_id' => $order->id,
                    'old_status' => $oldStatus,
                    'new_status' => $order->status,
                    'note' => 'Kế toán xác nhận Đã chuyển khoản hoàn tiền.',
                    'changed_by' => Auth::id(), 'changed_by_type' => 'admin'
                ]);
            } else {
                if ($order->status === 'cancelled') {
                    throw new \Exception('Đơn hàng đã hủy không thể đề xuất hay từ chối hoàn trả. Hãy chọn Hoàn Tiền Trực Tiếp.');
                }
                
                if ($order->customer_email) {
                    try {
                        Mail::to($order->customer_email)->send(new OrderRefundDealMail($order, $request->action));
                    } catch (\Exception $e) {
                        // Bỏ qua lỗi kết nối Mail cục bộ
                    }
                }
                
                $oldStatus = $order->status;
                if ($request->action === 'propose') {
                    $order->status = 'return_negotiating';
                    $historyNote = 'Đã gửi đề xuất số tiền hoàn lại. Đang chờ khách xác nhận.';
                    $refundStatusChanged = true;
                } else {
                    $order->status = 'delivered';
                    $historyNote = 'Đã gửi Email từ chối hoàn tiền. Yêu cầu hoàn trả bị hủy.';
                    $refundStatusChanged = true;
                }

                OrderStatusHistory::query()->create([
                    'order_id' => $order->id, 
                    'old_status' => $oldStatus, 
                    'new_status' => $order->status,
                    'note' => $historyNote,
                    'changed_by' => Auth::id(), 'changed_by_type' => 'admin'
                ]);
            }

            $order->save();
            DB::commit();

            if ($order->user_id) {
                $this->checkAndUpgradeUserTier($order->user_id);
            }

            if ($refundStatusChanged) {
                $this->notifyOrderStatusChanged($order, $refundOldStatus, $order->status);
            }

            $this->broadcastUpdate("Đơn hàng #{$order->order_code} vừa được xử lý hoàn trả/hoàn tiền!");

            return response()->json(['success' => true, 'message' => 'Xử lý thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        if (!in_array($order->status, ['cancelled', 'returned'])) {
            return response()->json(['success' => false, 'message' => 'Chỉ có thể xóa hóa đơn đã Hủy hoặc Hoàn trả'], 400);
        }

        $orderCode = $order->order_code;
        $order->delete();
        
        $this->broadcastUpdate("Đơn hàng #{$orderCode} đã bị đưa vào thùng rác!");

        return response()->json(['success' => true, 'message' => 'Đã đưa đơn hàng vào thùng rác']);
    }

    /**
     * [TỐI ƯU ORM 5] Gom gộp 2 truy vấn Sum & Count thành 1 Hit Query Data
     */
    protected function checkAndUpgradeUserTier($userId)
    {
        $user = User::find($userId);
        if (!$user) return;

        $stats = Order::where('user_id', $userId)
            ->where('status', 'delivered')
            ->where('payment_status', 'paid')
            ->select(
                DB::raw('COALESCE(SUM(total_amount), 0) as total_spent'),
                DB::raw('COUNT(id) as total_orders')
            )
            ->first();

        $totalSpent = $stats->total_spent;
        $totalOrders = $stats->total_orders;

        $user->accumulated_spent = $totalSpent;
        $user->accumulated_orders = $totalOrders;

        $newTier = MembershipTier::where('min_spent', '<=', $totalSpent)
                              ->orderBy('min_spent', 'desc')
                              ->first();

        if ($newTier && $user->tier_id !== $newTier->id) {
            $oldTierId = $user->tier_id;
            $user->tier_id = $newTier->id;

            TierHistory::create([
                'user_id'     => $user->id,
                'old_tier_id' => $oldTierId,
                'new_tier_id' => $newTier->id,
                'reason'      => 'Hệ thống tự động xét duyệt do tổng chi tiêu đạt ' . number_format($totalSpent) . ' VNĐ',
                'created_at'  => now()
            ]);
        }
        
        $user->save();
    }

    private function enrichComboSelections($orders)
    {
        $orderList = $orders instanceof \Illuminate\Database\Eloquent\Collection ? $orders : collect([$orders]);
        $variantIds = [];
        
        foreach ($orderList as $order) {
            if (!$order->items) continue;
            foreach ($order->items as $item) {
                if ($item->combo_id && is_array($item->combo_selections)) {
                    foreach ($item->combo_selections as $sel) {
                        if (isset($sel['selected_variant_id'])) {
                            $variantIds[] = $sel['selected_variant_id'];
                        }
                    }
                }
            }
        }
        
        if (empty($variantIds)) return;
        
        $variants = \App\Models\ProductVariant::with('product')->whereIn('id', array_unique($variantIds))->get()->keyBy('id');
        
        foreach ($orderList as $order) {
            if (!$order->items) continue;
            foreach ($order->items as $item) {
                if ($item->combo_id && is_array($item->combo_selections)) {
                    $selections = $item->combo_selections;
                    $changed = false;
                    foreach ($selections as &$sel) {
                        if (empty($sel['product_name']) && isset($sel['selected_variant_id'])) {
                            $variant = $variants->get($sel['selected_variant_id']);
                            if ($variant && $variant->product) {
                                $sel['product_name'] = $variant->product->name;
                                $sel['attributes'] = $variant->attributes;
                                $sel['price'] = $variant->promotional_price ?: $variant->price;
                                $changed = true;
                            }
                        }
                    }
                    if ($changed) {
                        $item->combo_selections = $selections;
                    }
                }
            }
        }
    }
}
