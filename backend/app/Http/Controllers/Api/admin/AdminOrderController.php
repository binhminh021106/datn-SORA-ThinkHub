<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\ProductVariant;
use App\Models\Combo;
use App\Models\User;
use App\Models\MembershipTier;
use App\Models\TierHistory;
use App\Models\TierServiceUsage;
use App\Http\Requests\AdminUpdateOrderRequest;
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

        if ($request->filled('start_date')) {
            $baseQuery->where('created_at', '>=', $request->start_date . ' 00:00:00');
        }
        if ($request->filled('end_date')) {
            $baseQuery->where('created_at', '<=', $request->end_date . ' 23:59:59');
        }

        if ($request->filled('payment_status') && $request->payment_status !== 'all') {
            $baseQuery->where('payment_status', $request->payment_status);
        }

        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $baseQuery->where(function ($q) use ($searchTerm) {
                $q->where('order_code', 'like', "%{$searchTerm}%")
                    ->orWhere('customer_name', 'like', "%{$searchTerm}%")
                    ->orWhere('customer_phone', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->boolean('is_return_page')) {
            $baseQuery->where(function ($q) {
                $q->whereIn('status', ['returned', 'return_requested'])
                    ->orWhere(function ($sub) {
                        $sub->where('status', 'cancelled')->whereIn('payment_status', ['paid', 'refunded']);
                    });
            });

            $countQuery = clone $baseQuery;
            $allReturns = $countQuery->get(['payment_status', 'refund_amount']);

            $counts = [
                'all'       => $allReturns->count(),
                'pending'   => $allReturns->where('payment_status', 'paid')->whereNull('refund_amount')->count(),
                'proposing' => $allReturns->filter(fn($q) => $q->payment_status === 'paid' && $q->refund_amount !== null && (float)$q->refund_amount > 0)->count(),
                'refunded'  => $allReturns->where('payment_status', 'refunded')->count(),
                'rejected'  => $allReturns->filter(fn($q) => $q->payment_status === 'paid' && $q->refund_amount !== null && (float)$q->refund_amount === 0.0)->count(),
            ];

            if ($request->filled('return_tab') && $request->return_tab !== 'all') {
                $tab = $request->return_tab;
                if ($tab === 'pending') {
                    $baseQuery->where('payment_status', 'paid')->whereNull('refund_amount');
                } elseif ($tab === 'proposing') {
                    $baseQuery->where('payment_status', 'paid')->whereNotNull('refund_amount')->where('refund_amount', '>', 0);
                } elseif ($tab === 'refunded') {
                    $baseQuery->where('payment_status', 'refunded');
                } elseif ($tab === 'rejected') {
                    $baseQuery->where('payment_status', 'paid')->whereNotNull('refund_amount')->where('refund_amount', 0);
                }
            }
        }
        else {
            $countQuery = clone $baseQuery;
            $rawCounts = $countQuery->select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();

            $counts = [
                'all'        => array_sum($rawCounts) - ($rawCounts['returned'] ?? 0) - ($rawCounts['return_requested'] ?? 0),
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
                $baseQuery->whereNotIn('status', ['returned', 'return_requested']);
            }
        }

        $orders = $baseQuery->with(['user:id,fullName,email'])
            ->withCount('items')
            ->orderBy('id', 'desc')
            ->paginate(15);

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
     * Hàm dùng chung để Hoàn lại Tồn kho và Hoàn lượt dùng Hạng TV
     */
    private function restoreOrderResources(Order $order)
    {
        // 1. HOÀN LẠI LƯỢT DÙNG ĐẶC QUYỀN HẠNG THÀNH VIÊN
        TierServiceUsage::where('order_id', $order->id)
            ->where('service_type', 'tier_discount')
            ->delete();

        // 2. HOÀN LẠI TỒN KHO SẢN PHẨM & LƯỢT DÙNG COMBO
        foreach ($order->items as $item) {
            if ($item->product_variant_id) {
                ProductVariant::where('id', $item->product_variant_id)->increment('stock_quantity', $item->quantity);
            } elseif ($item->combo_id) {
                Combo::where('id', $item->combo_id)->whereNotNull('usage_limit')->increment('usage_limit', $item->quantity);

                if (is_array($item->combo_selections)) {
                    foreach ($item->combo_selections as $selection) {
                        $vId = $selection['selected_variant_id'] ?? null;
                        if ($vId) {
                            ProductVariant::where('id', $vId)->increment('stock_quantity', $item->quantity);
                        }
                    }
                }

                $combo = Combo::with('items')->find($item->combo_id);
                if ($combo) {
                    foreach ($combo->items as $cItem) {
                        if ($cItem->product_variant_id) {
                            $totalQtyToRestore = $item->quantity * $cItem->quantity;
                            ProductVariant::where('id', $cItem->product_variant_id)->increment('stock_quantity', $totalQtyToRestore);
                        }
                    }
                }
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

            if ($oldStatus !== $newStatus) {
                $order->status = $newStatus;
                $hasChanged = true;

                OrderStatusHistory::create([
                    'order_id'        => $order->id,
                    'old_status'      => $oldStatus,
                    'new_status'      => $newStatus,
                    'note'            => $request->note,
                    'changed_by'      => Auth::id(),
                    'changed_by_type' => 'admin'
                ]);

                // if dh chuyển trạng thái từ Đang giao / Đã giao sang Hủy hoặc Trả hàng => Hoàn lại
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
            
            if ($order->user_id) {
                $this->checkAndUpgradeUserTier($order->user_id);
            }
            
            $this->broadcastUpdate("Trạng thái đơn hàng #{$order->order_code} vừa được cập nhật!");

            return response()->json(['success' => true, 'message' => 'Cập nhật trạng thái đơn hàng thành công']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Lỗi hệ thống: ' . $e->getMessage()], 500);
        }
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
            $order = Order::findOrFail($id);
            
            $order->refund_amount = $request->action === 'reject' ? 0 : $request->refund_amount;
            $order->refund_note = $request->refund_note;

            if ($request->action === 'refunded') {
                $order->payment_status = 'refunded';
                if ($order->status !== 'returned') {
                    $oldStatus = $order->status;
                    $order->status = 'returned'; 
                    
                    if (!in_array($oldStatus, ['cancelled', 'returned'])) {
                        $this->restoreOrderResources($order);
                    }
                }

                OrderStatusHistory::create([
                    'order_id' => $order->id, 'old_status' => $order->status, 'new_status' => $order->status,
                    'note' => 'Kế toán xác nhận Đã chuyển khoản hoàn tiền.',
                    'changed_by' => Auth::id(), 'changed_by_type' => 'admin'
                ]);
            } else {
                if ($order->customer_email) {
                    try {
                        Mail::to($order->customer_email)->send(new OrderRefundDealMail($order, $request->action));
                    } catch (\Exception $e) {
                        // Bỏ qua lỗi kết nối Mail cục bộ
                    }
                }
                
                $historyNote = $request->action === 'propose' ? 'Đã gửi Email thỏa thuận số tiền hoàn lại.' : 'Đã gửi Email từ chối hoàn tiền.';
                OrderStatusHistory::create([
                    'order_id' => $order->id, 'old_status' => $order->status, 'new_status' => $order->status,
                    'note' => $historyNote,
                    'changed_by' => Auth::id(), 'changed_by_type' => 'admin'
                ]);
            }

            $order->save();
            DB::commit();

            if ($order->user_id) {
                $this->checkAndUpgradeUserTier($order->user_id);
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

    //
    protected function checkAndUpgradeUserTier($userId)
    {
        $user = User::find($userId);
        if (!$user) return;

        // tính tổng chi tiêu và số đơn đã hoàn thành của user
        $totalSpent = Order::where('user_id', $userId)
                           ->where('status', 'delivered')
                           ->where('payment_status', 'paid')
                           ->sum('total_amount');

        // số đơn hàng đã hoàn thànhh
        $totalOrders = Order::where('user_id', $userId)
                            ->where('status', 'delivered')
                            ->where('payment_status', 'paid')
                            ->count();

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
}