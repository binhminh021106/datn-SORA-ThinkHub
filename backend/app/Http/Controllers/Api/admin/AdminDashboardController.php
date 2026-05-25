<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema; 

class AdminDashboardController extends Controller
{
    /**
     * Lọc đơn hàng được tính vào doanh thu.
     */
    private function applyRevenueFilter($query, $tablePrefix = '')
    {
        $statusCol = $tablePrefix ? $tablePrefix . '.status' : 'status';
        $paymentStatusCol = $tablePrefix ? $tablePrefix . '.payment_status' : 'payment_status';

        return $query->where(function ($q) use ($statusCol, $paymentStatusCol) {
            $q->where($statusCol, 'delivered')
              ->orWhere($paymentStatusCol, 'paid');
        })
        ->whereNotIn($statusCol, ['cancelled', 'returned', 'return_requested']);
    }

    private function calculatePercentageChange($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0; 
        }
        return round((($current - $previous) / $previous) * 100, 1);
    }

    public function index()
    {
        try {
            // 1. TỔNG QUAN
            $totalRevenue = $this->applyRevenueFilter(Order::query())->sum('total_amount') ?? 0; 
            $newOrders = Order::whereDate('created_at', Carbon::today())->count();
            $totalCustomers = User::count();
                
            $inventory = Schema::hasTable('product_variants') && Schema::hasColumn('product_variants', 'stock_quantity') 
                ? DB::table('product_variants')->whereNull('deleted_at')->sum('stock_quantity') 
                : 0;

            // 2. TÍNH TOÁN % TĂNG/GIẢM SO VỚI KỲ TRƯỚC
            $now = Carbon::now();
            $thisMonthStart = $now->copy()->startOfMonth();
            $lastMonthStart = $now->copy()->subMonth()->startOfMonth();
            $lastMonthEnd = $now->copy()->subMonth()->endOfMonth();

            $revenueThisMonth = $this->applyRevenueFilter(Order::query())->where('created_at', '>=', $thisMonthStart)->sum('total_amount') ?? 0;
            $revenueLastMonth = $this->applyRevenueFilter(Order::query())->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->sum('total_amount') ?? 0;
            $revenueGrowth = $this->calculatePercentageChange($revenueThisMonth, $revenueLastMonth);

            $ordersYesterday = Order::whereDate('created_at', Carbon::yesterday())->count();
            $ordersGrowth = $this->calculatePercentageChange($newOrders, $ordersYesterday);

            $customersThisMonth = User::where('created_at', '>=', $thisMonthStart)->count();
            $customersLastMonth = User::whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])->count();
            $customersGrowth = $this->calculatePercentageChange($customersThisMonth, $customersLastMonth);

            // 3. ĐƠN HÀNG GẦN ĐÂY
            $recentOrders = Order::with('user:id,fullName')->orderBy('created_at', 'desc')->take(5)->get()->map(function($order) {
                return [
                    'id' => $order->id,
                    'code' => $order->order_code ?? 'ORD-' . str_pad($order->id, 4, '0', STR_PAD_LEFT), 
                    'customer' => $order->user ? $order->user->fullName : ($order->customer_name ?? 'Khách lẻ'), 
                    'date' => $order->created_at->format('d/m/Y H:i'),
                    'total' => (float) ($order->total_amount ?? 0), 
                    'status' => $order->status ?? 'pending',
                ];
            });

            // 4. SẢN PHẨM BÁN CHẠY
            $productsQuery = DB::table('order_items')
                ->join('orders', 'order_items.order_id', '=', 'orders.id')
                ->whereNull('orders.deleted_at') 
                ->whereNotNull('order_items.product_id'); 
                
            $topProductsRaw = $this->applyRevenueFilter($productsQuery, 'orders')
                ->select('order_items.product_id', DB::raw('SUM(order_items.quantity) as total_sold'))
                ->groupBy('order_items.product_id')
                ->orderByDesc('total_sold')
                ->limit(5)
                ->get();

           $topProducts = $topProductsRaw->map(function($item) {
                $product = Product::withTrashed()->find($item->product_id);
                $stock = 0;
                if ($product && Schema::hasTable('product_variants') && Schema::hasColumn('product_variants', 'stock_quantity')) {
                    $stock = DB::table('product_variants')->where('product_id', $product->id)->whereNull('deleted_at')->sum('stock_quantity');
                }
                $snapshot = DB::table('order_items')->where('product_id', $item->product_id)->first();

                return [
                    'id' => $item->product_id,
                    'name' => $product ? $product->name : ($snapshot->product_name ?? 'Sản phẩm đã ngừng bán'),
                    'sold' => (int) $item->total_sold,
                    'stock' => $stock,
                    'price' => $product ? ($product->promotional_price ?? $product->base_price) : ($snapshot->price ?? 0), 
                    'image' => $product && $product->thumbnail_image ? asset('storage/' . $product->thumbnail_image) : '', 
                ];
            });

            // 5. THỐNG KÊ KHUYẾN MÃI (DỮ LIỆU THẬT)
            $activeCoupons = Coupon::where('status', 'active')->count();
            $expiredCoupons = Coupon::where('status', 'expired')->orWhere('expires_at', '<', Carbon::now())->count();
            $upcomingCoupons = Coupon::where('status', 'upcoming')->orWhere(function($q) {
                $q->where('status', 'inactive')->where('expires_at', '>', Carbon::now());
            })->count();
            $totalUses = Coupon::sum('usage_count') ?? 0;

            $couponSummary = [
                'active' => $activeCoupons,
                'upcoming' => $upcomingCoupons,
                'expired' => $expiredCoupons,
                'total_uses' => (int) $totalUses
            ];

            // Lấy 3 mã giảm giá mới nhất để hiển thị
            $couponsRaw = Coupon::orderBy('created_at', 'desc')->take(3)->get();
            $couponList = $couponsRaw->map(function($coupon) {
                $isPercent = in_array(strtolower($coupon->type), ['percent', '%', 'percentage']);
                $valDisplay = $isPercent ? $coupon->value . '%' : number_format($coupon->value, 0, ',', '.') . 'đ';
                
                $status = $coupon->status;
                if ($coupon->expires_at && Carbon::parse($coupon->expires_at)->isPast()) {
                    $status = 'expired';
                }

                return [
                    'id' => $coupon->id,
                    'name' => $coupon->name ?? $coupon->code,
                    'desc' => 'Đơn tối thiểu: ' . number_format($coupon->min_spend, 0, ',', '.') . 'đ',
                    'value_display' => $valDisplay,
                    'type' => $isPercent ? '% Giảm' : 'Giảm thẳng',
                    'category' => 'Khuyến mãi hệ thống',
                    'usage_count' => (int) $coupon->usage_count,
                    'usage_limit' => (int) $coupon->usage_limit,
                    'expires_at' => $coupon->expires_at ? Carbon::parse($coupon->expires_at)->format('d/m/Y') : 'Không giới hạn',
                    'status' => strtolower($status)
                ];
            });

            // 6. BIỂU ĐỒ & PAYMENT STATS (Mặc định lấy từ đầu năm nay đến hiện tại)
            $today = Carbon::today();
            $chartData = $this->getDynamicChartData($today->copy()->startOfYear(), $today->copy()->endOfDay());

            return response()->json([
                'success' => true,
                'message' => 'Lấy dữ liệu Dashboard thành công',
                'data' => [
                    'stats' => [
                        'totalRevenue' => (float) $totalRevenue,
                        'revenueGrowth' => $revenueGrowth,
                        'newOrders' => $newOrders,
                        'ordersGrowth' => $ordersGrowth,
                        'inventory' => (int) $inventory,
                        'totalCustomers' => $totalCustomers,
                        'customersGrowth' => $customersGrowth
                    ],
                    'recentOrders' => $recentOrders,
                    'topProducts' => $topProducts,
                    'paymentStats' => $chartData['paymentStats'],
                    'chartData' => [
                        'labels' => $chartData['labels'],
                        'values' => $chartData['values']
                    ],
                    'couponChart' => [
                        'labels' => $chartData['labels'],
                        'values' => $chartData['couponValues']
                    ],
                    'coupons' => [
                        'summary' => $couponSummary,
                        'list' => $couponList
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi hệ thống: ' . $e->getMessage() . ' in ' . $e->getFile() . ' on line ' . $e->getLine()
            ], 500);
        }
    }

    /**
     * API Lọc riêng cho Biểu đồ
     */
    public function chart(Request $request)
    {
        try {
            $isAll = $request->input('is_all') === 'true';
            $startDateInput = $request->input('start_date');
            $endDateInput = $request->input('end_date');
            $today = Carbon::today();

            if ($isAll) {
                $firstOrder = Order::orderBy('created_at', 'asc')->first();
                $startDate = $firstOrder ? $firstOrder->created_at->startOfDay() : Carbon::createFromDate(2026, 1, 1)->startOfDay();
                $endDate = $today->copy()->endOfDay();
            } else {
                if ($startDateInput && $endDateInput) {
                    $startDate = Carbon::parse($startDateInput)->startOfDay();
                    $endDate = Carbon::parse($endDateInput)->endOfDay();
                } elseif (!$startDateInput && $endDateInput) {
                    $endDate = Carbon::parse($endDateInput)->endOfDay();
                    $startDate = $endDate->copy()->startOfYear();
                } elseif ($startDateInput && !$endDateInput) {
                    $startDate = Carbon::parse($startDateInput)->startOfDay();
                    $endDate = $today->copy()->endOfDay();
                } else {
                    $startDate = $today->copy()->startOfYear();
                    $endDate = $today->copy()->endOfDay();
                }
            }

            if ($endDate > $today->copy()->endOfDay()) { $endDate = $today->copy()->endOfDay(); }
            if ($startDate > $today->copy()->endOfDay()) { $startDate = $today->copy()->endOfDay(); }
            if ($startDate > $endDate) {
                $temp = $startDate; $startDate = $endDate; $endDate = $temp;
            }

            $chartData = $this->getDynamicChartData($startDate, $endDate);

            return response()->json([
                'success' => true,
                'data' => [
                    'labels' => $chartData['labels'],
                    'values' => $chartData['values'],
                    'paymentStats' => $chartData['paymentStats'],
                    'couponChart' => [
                        'labels' => $chartData['labels'],
                        'values' => $chartData['couponValues']
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi biểu đồ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Tự động kéo dài thời gian (Auto-extend logic) nếu kỳ lọc rỗng
     * & nhóm dữ liệu (Ngày/Tháng/Năm) để biểu đồ gọn gàng
     */
    private function getDynamicChartData($startDate, $endDate)
    {
        // LOGIC AUTO-EXTEND (Tự động kéo về quá khứ tối đa 6 tháng nếu không có đơn hàng)
        $hasData = false;
        $currentStartDate = $startDate->copy();
        $maxTries = 6;
        $tries = 0;

        while ($tries < $maxTries) {
            $exists = Order::where('created_at', '>=', $currentStartDate)
                           ->where('created_at', '<=', $endDate)
                           ->exists();
            if ($exists) {
                $hasData = true;
                break;
            }
            // Nếu không có dữ liệu, lùi lại thêm 1 tháng
            $currentStartDate->subMonths(1)->startOfMonth();
            $tries++;
        }

        // Cập nhật lại startDate nếu quá trình lùi ngày tìm thấy dữ liệu
        if ($hasData) {
            $startDate = $currentStartDate;
        }

        $ordersQuery = Order::where('created_at', '>=', $startDate)
                            ->where('created_at', '<=', $endDate);

        $hasCouponId = Schema::hasColumn('orders', 'coupon_id');
        $hasDiscountAmount = Schema::hasColumn('orders', 'discount_amount');

        $orders = $this->applyRevenueFilter($ordersQuery)->get();
        $diffDays = $startDate->diffInDays($endDate);

        if ($diffDays <= 60) {
            $groupBy = 'day';
        } elseif ($diffDays <= 730) { 
            $groupBy = 'month';
        } else { 
            $groupBy = 'year';
        }

        $revenues = [];
        $couponUses = [];
        $paymentCounts = ['vnpay' => 0, 'momo' => 0, 'cod' => 0, 'bank' => 0];
        $totalPayments = 0;

        foreach ($orders as $order) {
            if ($groupBy === 'day') { $key = $order->created_at->format('Y-m-d'); } 
            elseif ($groupBy === 'month') { $key = $order->created_at->format('Y-m'); } 
            else { $key = $order->created_at->format('Y'); }

            if (!isset($revenues[$key])) { $revenues[$key] = 0; }
            $revenues[$key] += $order->total_amount;

            // Đếm số lượt sử dụng coupon theo ngày
            if (!isset($couponUses[$key])) { $couponUses[$key] = 0; }
            if ($hasCouponId && $order->coupon_id) {
                $couponUses[$key]++;
            } elseif ($hasDiscountAmount && $order->discount_amount > 0) {
                $couponUses[$key]++;
            }

            // Phân tích phương thức thanh toán
            $method = strtolower($order->payment_method ?? '');
            if (str_contains($method, 'vnpay')) {
                $paymentCounts['vnpay']++;
            } elseif (str_contains($method, 'momo')) {
                $paymentCounts['momo']++;
            } elseif (str_contains($method, 'cod') || str_contains($method, 'cash') || str_contains($method, 'tiền mặt')) {
                $paymentCounts['cod']++;
            } else {
                $paymentCounts['bank']++;
            }
            $totalPayments++;
        }

        // Tính % payment stats
        $paymentStats = [
            'vnpayPercent' => $totalPayments > 0 ? (int) round(($paymentCounts['vnpay'] / $totalPayments) * 100) : 0,
            'momoPercent' => $totalPayments > 0 ? (int) round(($paymentCounts['momo'] / $totalPayments) * 100) : 0,
            'codPercent' => $totalPayments > 0 ? (int) round(($paymentCounts['cod'] / $totalPayments) * 100) : 0,
            'bankPercent' => $totalPayments > 0 ? (int) round(($paymentCounts['bank'] / $totalPayments) * 100) : 0,
        ];

        // Do làm tròn đôi khi không tròn 100%, thực hiện bù trừ nhẹ ở codPercent nếu cần thiết
        if ($totalPayments > 0) {
            $sum = $paymentStats['vnpayPercent'] + $paymentStats['momoPercent'] + $paymentStats['codPercent'] + $paymentStats['bankPercent'];
            if ($sum !== 100 && $sum > 0) {
                $paymentStats['codPercent'] += (100 - $sum);
            }
        }

        $labels = [];
        $values = [];
        $couponValues = [];
        $currentDate = $startDate->copy();

        if ($groupBy === 'day') {
            $currentDate->startOfDay();
            $end = $endDate->copy()->startOfDay();
            while ($currentDate <= $end) {
                $dateString = $currentDate->format('Y-m-d');
                $labels[] = $currentDate->format('d/m');
                $values[] = isset($revenues[$dateString]) ? (float) $revenues[$dateString] : 0;
                $couponValues[] = isset($couponUses[$dateString]) ? (int) $couponUses[$dateString] : 0;
                $currentDate->addDay();
            }
        } elseif ($groupBy === 'month') {
            $currentDate->startOfMonth();
            $end = $endDate->copy()->startOfMonth();
            while ($currentDate <= $end) {
                $dateString = $currentDate->format('Y-m');
                $labels[] = $currentDate->format('m/Y');
                $values[] = isset($revenues[$dateString]) ? (float) $revenues[$dateString] : 0;
                $couponValues[] = isset($couponUses[$dateString]) ? (int) $couponUses[$dateString] : 0;
                $currentDate->addMonth();
            }
        } else { 
            $currentDate->startOfYear();
            $end = $endDate->copy()->startOfYear();
            while ($currentDate <= $end) {
                $dateString = $currentDate->format('Y');
                $labels[] = $dateString; 
                $values[] = isset($revenues[$dateString]) ? (float) $revenues[$dateString] : 0;
                $couponValues[] = isset($couponUses[$dateString]) ? (int) $couponUses[$dateString] : 0;
                $currentDate->addYear();
            }
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'couponValues' => $couponValues,
            'paymentStats' => $paymentStats
        ];
    }
}