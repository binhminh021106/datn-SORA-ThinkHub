<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\User;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\Review;
use App\Models\Combo;
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

    private function resolvePeriod(Request $request): array
    {
        $today = Carbon::today();
        $todayString = $today->format('Y-m-d');

        $request->validate([
            'period' => 'nullable|in:today,last_7_days,last_30_days,this_month,last_month,custom,all',
            'start_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:' . $todayString],
            'end_date' => ['nullable', 'date_format:Y-m-d', 'before_or_equal:' . $todayString],
        ]);

        $period = $request->input('period', 'this_month');

        if ($period === 'custom') {
            if (!$request->filled('start_date') || !$request->filled('end_date')) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'date_range' => ['Vui lòng chọn đầy đủ từ ngày và đến ngày.'],
                ]);
            }

            $startDate = Carbon::createFromFormat('Y-m-d', $request->input('start_date'))->startOfDay();
            $endDate = Carbon::createFromFormat('Y-m-d', $request->input('end_date'))->endOfDay();

            if ($startDate->greaterThan($endDate)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'end_date' => ['Đến ngày phải sau hoặc bằng từ ngày.'],
                ]);
            }

            return ['key' => $period, 'start' => $startDate, 'end' => $endDate, 'label' => 'Tùy chỉnh'];
        }

        if ($period === 'today') {
            $startDate = $today->copy()->startOfDay();
            $label = 'Hôm nay';
        } elseif ($period === 'last_7_days') {
            $startDate = $today->copy()->subDays(6)->startOfDay();
            $label = '7 ngày qua';
        } elseif ($period === 'last_30_days') {
            $startDate = $today->copy()->subDays(29)->startOfDay();
            $label = '30 ngày qua';
        } elseif ($period === 'last_month') {
            $startDate = $today->copy()->subMonthNoOverflow()->startOfMonth();
            return ['key' => $period, 'start' => $startDate, 'end' => $startDate->copy()->endOfMonth(), 'label' => 'Tháng trước'];
        } elseif ($period === 'all') {
            $firstOrderDate = Order::orderBy('created_at')->value('created_at');
            $startDate = $firstOrderDate ? Carbon::parse($firstOrderDate)->startOfDay() : $today->copy()->startOfDay();
            $label = 'Toàn thời gian';
        } else {
            $startDate = $today->copy()->startOfMonth();
            $label = 'Tháng này';
        }

        return ['key' => $period, 'start' => $startDate, 'end' => $today->copy()->endOfDay(), 'label' => $label];
    }

    private function previousPeriod(array $period): ?array
    {
        if ($period['key'] === 'all') {
            return null;
        }

        $dayCount = $period['start']->diffInDays($period['end']);
        $end = $period['start']->copy()->subSecond();

        return [
            'start' => $end->copy()->subDays($dayCount)->startOfDay(),
            'end' => $end,
        ];
    }

    public function index(Request $request)
    {
        try {
            // 1. TỔNG QUAN
            $period = $this->resolvePeriod($request);
            $previousPeriod = $this->previousPeriod($period);
            $periodOrders = Order::query()->whereBetween('created_at', [$period['start'], $period['end']]);
            $totalRevenue = $this->applyRevenueFilter((clone $periodOrders))->sum('total_amount') ?? 0;
            $newOrders = (clone $periodOrders)->count();
            $totalCustomers = User::whereBetween('created_at', [$period['start'], $period['end']])->count();
            $successfulOrders = $this->applyRevenueFilter((clone $periodOrders))->count();
            $cancelledOrders = (clone $periodOrders)->whereIn('status', ['cancelled', 'returned', 'return_requested'])->count();
            $averageOrderValue = $successfulOrders > 0 ? $totalRevenue / $successfulOrders : 0;
                
            $inventory = Schema::hasTable('product_variants') && Schema::hasColumn('product_variants', 'stock_quantity') 
                ? DB::table('product_variants')->whereNull('deleted_at')->sum('stock_quantity') 
                : 0;

            // 2. TÍNH TOÁN % TĂNG/GIẢM SO VỚI KỲ TRƯỚC
            $revenueGrowth = null;
            $ordersGrowth = null;
            $customersGrowth = null;

            if ($previousPeriod) {
                $previousOrders = Order::query()->whereBetween('created_at', [$previousPeriod['start'], $previousPeriod['end']]);
                $revenueGrowth = $this->calculatePercentageChange(
                    $totalRevenue,
                    $this->applyRevenueFilter((clone $previousOrders))->sum('total_amount') ?? 0
                );
                $ordersGrowth = $this->calculatePercentageChange($newOrders, (clone $previousOrders)->count());
                $customersGrowth = $this->calculatePercentageChange(
                    $totalCustomers,
                    User::whereBetween('created_at', [$previousPeriod['start'], $previousPeriod['end']])->count()
                );
            }

            // 3. ĐƠN HÀNG GẦN ĐÂY
            $recentOrders = (clone $periodOrders)->with('user:id,fullName')->orderBy('created_at', 'desc')->take(8)->get()->map(function($order) {
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
                ->whereNotNull('order_items.product_id')
                ->whereBetween('orders.created_at', [$period['start'], $period['end']]);
                
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

            // 4.1. CẢNH BÁO TỒN KHO THẤP (LOW STOCK)
            $lowStockProducts = collect([]);
            if (Schema::hasTable('product_variants') && Schema::hasColumn('product_variants', 'stock_quantity')) {
                $lowStockRaw = DB::table('product_variants')
                    ->join('products', 'product_variants.product_id', '=', 'products.id')
                    ->whereNull('product_variants.deleted_at')
                    ->whereNull('products.deleted_at')
                    ->where('product_variants.stock_quantity', '<', 10)
                    ->select('products.id', 'products.name', DB::raw('MIN(product_variants.stock_quantity) as stock'), 'products.thumbnail_image as image', DB::raw('MIN(product_variants.sku) as sku'))
                    ->groupBy('products.id', 'products.name', 'products.thumbnail_image')
                    ->orderBy('stock', 'asc')
                    ->take(5)
                    ->get();
                    
                $lowStockProducts = $lowStockRaw->map(function($item) {
                    return [
                        'id' => $item->id,
                        'name' => $item->name,
                        'sku' => $item->sku,
                        'stock' => (int) $item->stock,
                        'image' => $item->image ? asset('storage/' . $item->image) : '',
                    ];
                });
            }

            // 4.2. ĐÁNH GIÁ MỚI NHẤT (RECENT REVIEWS)
            $recentReviews = collect([]);
            if (Schema::hasTable('reviews')) {
                $recentReviewsRaw = Review::with('user:id,fullName,avatar_url')
                    ->whereBetween('created_at', [$period['start'], $period['end']])
                    ->orderBy('created_at', 'desc')
                    ->take(5)
                    ->get();
                $recentReviews = $recentReviewsRaw->map(function($review) {
                    return [
                        'id' => $review->id,
                        'user_name' => $review->user ? $review->user->fullName : 'Khách hàng',
                        'user_avatar' => $review->user && $review->user->avatar_url ? $review->user->avatar_url : null,
                        'rating' => (int) $review->rating,
                        'comment' => $review->comment,
                        'date' => $review->created_at->diffForHumans(),
                    ];
                });
            }

            // 4.3. COMBO ĐANG CHẠY (ACTIVE COMBOS)
            $activeCombos = collect([]);
            if (Schema::hasTable('combos')) {
                $activeCombosRaw = Combo::where('status', 'active')->orderBy('created_at', 'desc')->take(5)->get();
                $activeCombos = $activeCombosRaw->map(function($combo) {
                    return [
                        'id' => $combo->id,
                        'name' => $combo->name,
                        'discount_type' => $combo->discount_type,
                        'discount_value' => (float) $combo->discount_value,
                        'image' => $combo->thumbnail_image ? asset('storage/' . $combo->thumbnail_image) : '',
                        'start_date' => $combo->start_date ? Carbon::parse($combo->start_date)->format('d/m/Y') : 'Không giới hạn',
                        'end_date' => $combo->end_date ? Carbon::parse($combo->end_date)->format('d/m/Y') : 'Không giới hạn',
                    ];
                });
            }

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
            $chartData = $this->getDynamicChartData($period['start'], $period['end']);

            // 7. NHÂN SỰ (STAFF STATS)
            $totalStaff = Schema::hasTable('admins') ? DB::table('admins')->whereNull('deleted_at')->count() : User::where('role_id', '!=', 2)->count();
            
            // Tìm ca làm việc hiện tại
            $nowTime = Carbon::now()->format('H:i:s');
            $currentShiftInfo = "Không có ca làm";

            if (Schema::hasTable('work_shifts')) {
                // Ca bình thường
                $currentShift = DB::table('work_shifts')
                    ->where('start_time', '<=', $nowTime)
                    ->where('end_time', '>=', $nowTime)
                    ->whereNull('deleted_at')
                    ->where('is_active', true)
                    ->first();
                
                if (!$currentShift) {
                    // Xử lý ca qua đêm (start_time > end_time)
                    $currentShift = DB::table('work_shifts')
                        ->where('is_overnight', true)
                        ->whereNull('deleted_at')
                        ->where('is_active', true)
                        ->where(function ($q) use ($nowTime) {
                            $q->where('start_time', '<=', $nowTime)
                              ->orWhere('end_time', '>=', $nowTime);
                        })
                        ->first();
                }

                if ($currentShift) {
                    $start = Carbon::parse($currentShift->start_time)->format('H:i');
                    $end = Carbon::parse($currentShift->end_time)->format('H:i');
                    $currentShiftInfo = "{$currentShift->name} ($start - $end)";
                }
            }

            $staffStats = [
                'total' => $totalStaff,
                'current_shift' => $currentShiftInfo
            ];

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
                        'customersGrowth' => $customersGrowth,
                        'averageOrderValue' => (float) $averageOrderValue,
                        'successfulOrders' => $successfulOrders,
                        'cancelledOrders' => $cancelledOrders,
                    ],
                    'period' => [
                        'key' => $period['key'],
                        'label' => $period['label'],
                        'start_date' => $period['start']->format('Y-m-d'),
                        'end_date' => $period['end']->format('Y-m-d'),
                    ],
                    'recentOrders' => $recentOrders,
                    'topProducts' => $topProducts,
                    'lowStockProducts' => $lowStockProducts,
                    'recentReviews' => $recentReviews,
                    'activeCombos' => $activeCombos,
                    'paymentStats' => $chartData['paymentStats'],
                    'staffStats' => $staffStats,
                    'chartData' => [
                        'labels' => $chartData['labels'],
                        'values' => $chartData['values'],
                        'orderCounts' => $chartData['orderCounts'],
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

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
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
            $period = $this->resolvePeriod($request);
            $chartData = $this->getDynamicChartData($period['start'], $period['end']);

            return response()->json([
                'success' => true,
                'data' => [
                    'labels' => $chartData['labels'],
                    'values' => $chartData['values'],
                    'orderCounts' => $chartData['orderCounts'],
                    'paymentStats' => $chartData['paymentStats'],
                    'couponChart' => [
                        'labels' => $chartData['labels'],
                        'values' => $chartData['couponValues']
                    ]
                ]
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            throw $e;
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi biểu đồ: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Nhóm dữ liệu theo ngày, tháng hoặc năm cho đúng kỳ đã chọn.
     */
    private function getDynamicChartData($startDate, $endDate)
    {
        $ordersQuery = Order::where('created_at', '>=', $startDate)
                            ->where('created_at', '<=', $endDate);

        $hasCouponId = Schema::hasColumn('orders', 'coupon_id');
        $hasDiscountAmount = Schema::hasColumn('orders', 'discount_amount');

        $orderColumns = ['created_at', 'total_amount', 'payment_method'];
        if ($hasCouponId) {
            $orderColumns[] = 'coupon_id';
        }
        if ($hasDiscountAmount) {
            $orderColumns[] = 'discount_amount';
        }

        // Iterate lazily so a long dashboard period does not retain every order in memory.
        $orders = $this->applyRevenueFilter($ordersQuery)
            ->select($orderColumns)
            ->cursor();
        $diffDays = $startDate->diffInDays($endDate);

        if ($diffDays <= 60) {
            $groupBy = 'day';
        } elseif ($diffDays <= 730) { 
            $groupBy = 'month';
        } else { 
            $groupBy = 'year';
        }

        $revenues = [];
        $orderCounts = [];
        $couponUses = [];
        $paymentCounts = ['vnpay' => 0, 'momo' => 0, 'cod' => 0, 'bank' => 0];
        $totalPayments = 0;

        foreach ($orders as $order) {
            if ($groupBy === 'day') { $key = $order->created_at->format('Y-m-d'); } 
            elseif ($groupBy === 'month') { $key = $order->created_at->format('Y-m'); } 
            else { $key = $order->created_at->format('Y'); }

            if (!isset($revenues[$key])) { $revenues[$key] = 0; }
            $revenues[$key] += $order->total_amount;
            if (!isset($orderCounts[$key])) { $orderCounts[$key] = 0; }
            $orderCounts[$key]++;

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
        $orderCountValues = [];
        $couponValues = [];
        $currentDate = $startDate->copy();

        if ($groupBy === 'day') {
            $currentDate->startOfDay();
            $end = $endDate->copy()->startOfDay();
            while ($currentDate <= $end) {
                $dateString = $currentDate->format('Y-m-d');
                $labels[] = $currentDate->format('d/m');
                $values[] = isset($revenues[$dateString]) ? (float) $revenues[$dateString] : 0;
                $orderCountValues[] = isset($orderCounts[$dateString]) ? (int) $orderCounts[$dateString] : 0;
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
                $orderCountValues[] = isset($orderCounts[$dateString]) ? (int) $orderCounts[$dateString] : 0;
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
                $orderCountValues[] = isset($orderCounts[$dateString]) ? (int) $orderCounts[$dateString] : 0;
                $couponValues[] = isset($couponUses[$dateString]) ? (int) $couponUses[$dateString] : 0;
                $currentDate->addYear();
            }
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'orderCounts' => $orderCountValues,
            'couponValues' => $couponValues,
            'paymentStats' => $paymentStats
        ];
    }
}
