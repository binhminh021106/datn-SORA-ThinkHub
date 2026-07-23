<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\ProductVariant;
use App\Models\UserAddress;
use App\Models\Coupon;
use App\Models\Combo;
use App\Models\TierServiceUsage;
use App\Models\MembershipTier;
use App\Http\Requests\Client\Checkout\UserCheckoutRequest;
use App\Jobs\SendOrderSuccessNotificationsJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Events\NewOrderReceived;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ClientCheckoutController extends Controller
{
    public function initData(Request $request)
    {
        $cart = $this->resolveCart($request);
        $cartItems = $cart ? $cart->items->load(['variant.product', 'combo.items.variant']) : [];

        $addresses = [];
        $userData = null;
        $tierDiscountInfo = null;

        $user = auth('sanctum')->user();
        if ($user && $user instanceof \App\Models\User) {
            $addresses = UserAddress::where('user_id', $user->id)->get();
            $userData = [
                'id'    => $user->id,
                'name'  => $user->fullName ?? $user->name ?? '',
                'email' => $user->email ?? '',
                'phone' => $user->phone ?? ''
            ];

            if ($user->tier_id) {
                $tier = MembershipTier::find($user->tier_id);
                if ($tier && $tier->discount_percent > 0) {
                    $usedCount = TierServiceUsage::where('user_id', $user->id)
                        ->where('service_type', 'tier_discount')
                        ->whereYear('used_at', now()->year)
                        ->count();
                    
                    $maxLimit = $tier->yearly_discount_quota ?? 0;
                    
                    $tierDiscountInfo = [
                        'tier_name' => $tier->name,
                        'discount_percent' => $tier->discount_percent,
                        'yearly_quota' => $maxLimit,
                        'used_count' => $usedCount,
                        'remaining_quota' => max(0, $maxLimit - $usedCount)
                    ];
                }
            }
        }

 // Thay thế toàn bộ khối truy vấn $coupons = Coupon::where...
        $coupons = Coupon::where('status', 'active')
            ->where(function ($q) use ($user) {
                // 1. Lấy các mã Public (Không gắn user cụ thể VÀ không phải mã sinh nhật)
                $q->where(function ($subQ) {
                    $subQ->whereNull('user_id')
                         ->where('name', 'NOT LIKE', '%sinh nhật%');
                });

                // 2. Hoặc lấy mã Cá nhân (Cấp riêng cho user này, bao gồm mã sinh nhật cá nhân hoá)
                if ($user) {
                    $q->orWhere('user_id', $user->id);
                }
            })
            // Chỉ lấy mã còn hạn
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            // Bỏ dòng lấy mã còn tổng số lượng phát hành ở đây để FE hiển thị xám
            ->get();

        // 3. Xử lý logic hiển thị mã khả dụng / vô hiệu hóa
        $coupons->transform(function ($coupon) use ($user) {
            $coupon->is_disabled = false;
            $coupon->disabled_reason = '';

            // Kiểm tra giới hạn tổng
            if (!is_null($coupon->usage_limit) && $coupon->usage_count >= $coupon->usage_limit) {
                $coupon->is_disabled = true;
                $coupon->disabled_reason = 'Đã hết lượt sử dụng';
            } 
            // Kiểm tra giới hạn cá nhân
            elseif ($user && $this->hasUserReachedCouponLimit($coupon, $user)) {
                $coupon->is_disabled = true;
                $coupon->disabled_reason = 'Bạn đã dùng mã này';
            }

            return $coupon;
        });

        // Đẩy mã disabled xuống cuối
        $coupons = $coupons->sortBy('is_disabled')->values();

        return response()->json([
            'success'          => true,
            'cart_items'       => $cartItems,
            'addresses'        => $addresses,
            'coupons'          => $coupons,
            'user'             => $userData,
            'tier_discount'    => $tierDiscountInfo
        ]);
    }

    public function processCheckout(UserCheckoutRequest $request)
    {
        $cart = $this->resolveCart($request);

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng trống hoặc phiên đã hết hạn.'], 400);
        }

        $user = auth('sanctum')->user();
        if (!$user || !($user instanceof \App\Models\User)) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để thực hiện thanh toán.'], 401);
        }

        $sessionId = $request->header('X-Cart-Session-Id');

        $lockKey = 'checkout_lock_' . ($user ? $user->id : $sessionId);
        $lock = Cache::lock($lockKey, 10);

        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Hệ thống đang xử lý đơn hàng của bạn, vui lòng không bấm liên tục...'
            ], 429);
        }

        try {
            return DB::transaction(function () use ($request, $cart, $user) {

                $customerName = $request->customer_name;
                $customerPhone = $request->customer_phone;
                $customerAddress = $request->customer_address;

                if ($request->user_address_id && $user) {
                    $address = UserAddress::where('user_id', $user->id)->find($request->user_address_id);
                    if ($address) {
                        $customerName = $address->customer_name;
                        $customerPhone = $address->customer_phone;
                        $customerAddress = collect([
                            $address->shipping_address,
                            $address->ward,
                            $address->district,
                            $address->city,
                        ])->filter()->implode(', ');
                    }
                }

                $variantIdsToLock = [];
                $comboIdsToLock = [];

                foreach ($cart->items as $item) {
                    if ($item->product_variant_id) {
                        $variantIdsToLock[] = $item->product_variant_id;
                    } elseif ($item->combo_id) {
                        $comboIdsToLock[] = $item->combo_id;
                        if (is_array($item->combo_selections)) {
                            $variantIdsToLock = array_merge($variantIdsToLock, array_column($item->combo_selections, 'selected_variant_id'));
                        }
                    }
                }

                $combos = Combo::with(['items' => function ($q) {
                    $q->whereNotNull('product_variant_id');
                }])->whereIn('id', array_unique($comboIdsToLock))->lockForUpdate()->get()->keyBy('id');

                foreach ($combos as $combo) {
                    foreach ($combo->items as $cItem) {
                        if ($cItem->product_variant_id) {
                            $variantIdsToLock[] = $cItem->product_variant_id;
                        }
                    }
                }

                $variants = ProductVariant::with('product')->whereIn('id', array_unique($variantIdsToLock))
                    ->orderBy('id')->lockForUpdate()->get()->keyBy('id');

                $subTotal = 0;
                $totalCommissionAmount = 0;
                $orderItemsData = [];
                $updatedProductIds = [];
                $updatedComboIds = [];

                foreach ($cart->items as $item) {
                    if ($item->product_variant_id) {
                        $variant = $variants->get($item->product_variant_id);
                        if (!$variant || $variant->stock_quantity < $item->quantity) {
                            throw new \Exception("Sản phẩm SKU {$variant->sku} không đủ số lượng.");
                        }

                        $variant->stock_quantity -= $item->quantity;
                        $variant->save();
                        $updatedProductIds[] = $variant->product_id;

                        $itemTotal = $item->subtotal;
                        $subTotal += $itemTotal;

                        // TÍNH HOA HỒNG TỪNG SẢN PHẨM
                        $commissionRate = $variant->product->affiliate_commission_rate ?? 0;
                        $totalCommissionAmount += $itemTotal * ($commissionRate / 100);

                        $orderItemsData[] = [
                            'product_id'         => $variant->product_id,
                            'product_variant_id' => $variant->id,
                            'product_name'       => $variant->product->name ?? 'Sản phẩm SORA',
                            'variant_sku'        => $variant->sku,
                            'variant_attributes' => $variant->attributes,
                            'variant_image'      => $variant->image_url,
                            'price'              => $item->price,
                            'quantity'           => $item->quantity,
                            'total_price'        => $itemTotal,
                            'combo_id'           => null,
                            'combo_selections'   => null,
                        ];
                    } elseif ($item->combo_id) {
                        $combo = $combos->get($item->combo_id);
                        if (!$combo) {
                            throw new \Exception("Combo không tồn tại hoặc đã ngừng kinh doanh.");
                        }

                        if ($combo->usage_limit !== null) {
                            if ($combo->usage_limit < $item->quantity) {
                                throw new \Exception("Gói ưu đãi {$combo->name} đã vượt quá số lượt bán cho phép.");
                            }
                            $combo->usage_limit -= $item->quantity;
                            $combo->save();
                            $updatedComboIds[] = $combo->id;
                        }

                        if (is_array($item->combo_selections)) {
                            foreach ($item->combo_selections as $selection) {
                                $vId = $selection['selected_variant_id'] ?? null;
                                if ($vId) {
                                    $variant = $variants->get($vId);
                                    if (!$variant || $variant->stock_quantity < $item->quantity) {
                                        throw new \Exception("Một sản phẩm tự chọn trong bộ {$combo->name} đã hết hàng.");
                                    }
                                    $variant->stock_quantity -= $item->quantity;
                                    $variant->save();
                                    $updatedProductIds[] = $variant->product_id;
                                }
                            }
                        }

                        foreach ($combo->items as $cItem) {
                            if ($cItem->product_variant_id) {
                                $variant = $variants->get($cItem->product_variant_id);
                                $totalQtyNeeded = $item->quantity * $cItem->quantity;

                                if (!$variant || $variant->stock_quantity < $totalQtyNeeded) {
                                    throw new \Exception("Sản phẩm cố định trong bộ {$combo->name} đã hết hàng.");
                                }
                                $variant->stock_quantity -= $totalQtyNeeded;
                                $variant->save();
                                $updatedProductIds[] = $variant->product_id;
                            }
                        }

                        $itemTotal = $item->subtotal;
                        $subTotal += $itemTotal;

                        $orderItemsData[] = [
                            'product_id'         => null,
                            'product_variant_id' => null,
                            'product_name'       => $combo->name,
                            'variant_sku'        => 'COMBO-' . $item->combo_id,
                            'variant_attributes' => null,
                            'variant_image'      => $combo->thumbnail_image,
                            'price'              => $item->price,
                            'quantity'           => $item->quantity,
                            'total_price'        => $itemTotal,
                            'combo_id'           => $item->combo_id,
                            'combo_selections'   => $item->combo_selections,
                        ];
                    }
                }

                $discountAmount = 0;
                $couponId = null;
                if ($request->coupon_code) {
                    $coupon = Coupon::where('code', $request->coupon_code)->lockForUpdate()->first();
                    if (!$coupon || $coupon->status !== 'active') {
                        throw new \Exception("Mã giảm giá không hợp lệ hoặc đã tạm ngưng sử dụng.");
                    }
                    if (str_contains(mb_strtolower($coupon->name, 'UTF-8'), 'sinh nhật') && is_null($coupon->user_id)) {
                        throw new \Exception("Mã giảm giá sinh nhật này đã cũ và không còn hợp lệ.");
                    }
                    if ($coupon->user_id && (!$user || (int) $user->id !== (int) $coupon->user_id)) {
                        throw new \Exception("Mã giảm giá này không thuộc quyền sở hữu của bạn.");
                    }
                    if ($coupon->expires_at && now()->greaterThan($coupon->expires_at)) {
                        throw new \Exception("Mã giảm giá đã hết hạn.");
                    }
                    if ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
                        throw new \Exception("Mã giảm giá đã hết lượt sử dụng.");
                    }
                    if ($this->hasUserReachedCouponLimit($coupon, $user)) {
                        throw new \Exception("Bạn đã sử dụng hết lượt cho mã giảm giá này.");
                    }
                    if ($subTotal < $coupon->min_spend) {
                        throw new \Exception("Đơn hàng chưa đạt giá trị tối thiểu (" . number_format($coupon->min_spend, 0, ',', '.') . "đ) để áp dụng mã giảm giá này.");
                    }

                    $discountAmount = ($coupon->type === 'fixed') ? $coupon->value : ($subTotal * ($coupon->value / 100));
                    $couponId = $coupon->id;
                    $coupon->increment('usage_count');

                }

                $tierDiscountAmount = 0;
                $isTierDiscountApplied = false;
                $appliedTier = null;

                if ($user->tier_id) {
                    $tier = MembershipTier::find($user->tier_id);
                    if ($tier && $tier->discount_percent > 0) { 
                        $usedCount = TierServiceUsage::where('user_id', $user->id)
                            ->where('service_type', 'tier_discount')
                            ->whereYear('used_at', now()->year)
                            ->count();

                        $maxLimit = $tier->yearly_discount_quota ?? 0;

                        if ($usedCount < $maxLimit) {
                            $tierDiscountAmount = $subTotal * ($tier->discount_percent / 100);
                            $isTierDiscountApplied = true;
                            $appliedTier = $tier;
                        }
                    }
                }

                $shippingFee = $request->shipping_fee !== null ? (float)$request->shipping_fee : 0;
                $totalAmount = max($subTotal - $discountAmount - $tierDiscountAmount, 0) + $shippingFee;

                // CÂN BẰNG TỈ LỆ HOA HỒNG THEO SỐ TIỀN THỰC TẾ
                $actualCommission = 0;
                if ($subTotal > 0 && $totalCommissionAmount > 0) {
                    $ratio = max($subTotal - $discountAmount - $tierDiscountAmount, 0) / $subTotal;
                    $actualCommission = $totalCommissionAmount * $ratio;
                }

                // TÌM ĐỐI TÁC GIỚI THIỆU
                $affiliateUserId = null;
                if ($request->filled('affiliate_code')) {
                    $affiliateUser = \App\Models\User::where('affiliate_code', $request->affiliate_code)->where('is_affiliate', true)->first();
                    // Không cho phép tự giới thiệu chính mình
                    if ($affiliateUser && $affiliateUser->id !== $user->id) {
                        $affiliateUserId = $affiliateUser->id;
                    }
                }

                $order = Order::create([
                    'order_code'           => 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
                    'user_id'              => $user->id ?? null,
                    'affiliate_user_id'    => $affiliateUserId,
                    'customer_name'        => $customerName,
                    'customer_phone'       => $customerPhone,
                    'customer_email'       => $request->customer_email,
                    'customer_address'     => $customerAddress,
                    'order_note'           => $request->order_note,
                    'sub_total'            => $subTotal,
                    'discount_amount'      => $discountAmount,
                    'tier_discount_amount' => $tierDiscountAmount,
                    'shipping_fee'         => $shippingFee,
                    'total_amount'         => $totalAmount,
                    'coupon_id'            => $couponId,
                    'coupon_code'          => $request->coupon_code,
                    'payment_method'       => $request->payment_method,
                    'payment_status'       => 'unpaid',
                    'status'               => 'pending',
                ]);

                foreach ($orderItemsData as $itemData) {
                    $itemData['order_id'] = $order->id;
                    OrderItem::create($itemData);
                }

                if ($isTierDiscountApplied && $appliedTier) {
                    TierServiceUsage::create([
                        'user_id' => $user->id,
                        'order_id' => $order->id,
                        'service_type' => 'tier_discount',
                        'used_at' => now(),
                        'notes' => "Áp dụng giảm {$appliedTier->discount_percent}% hạng {$appliedTier->name} cho đơn hàng {$order->order_code}",
                    ]);
                }

                OrderStatusHistory::create([
                    'order_id'        => $order->id,
                    'new_status'      => 'pending',
                    'note'            => 'Khách hàng đặt đơn thành công',
                    'changed_by'      => $user->id ?? null,
                    'changed_by_type' => $user ? 'user' : 'guest',
                ]);

                // GHI LỊCH SỬ HOA HỒNG (TRẠNG THÁI CHỜ - PENDING)
                if ($affiliateUserId && $actualCommission > 0) {
                    \App\Models\CommissionHistory::create([
                        'user_id'     => $affiliateUserId,
                        'order_id'    => $order->id,
                        'amount'      => $actualCommission,
                        'type'        => 'earn',
                        'status'      => 'pending', // Chờ duyệt
                        'description' => "Hoa hồng tạm tính từ đơn hàng " . $order->order_code,
                        'created_at'  => now()
                    ]);
                }

                \Illuminate\Support\Facades\DB::afterCommit(function () use ($order, $updatedProductIds, $updatedComboIds) {
                    try {
                        broadcast(new NewOrderReceived($order->order_code, (float) $order->total_amount));
                        
                        $this->broadcastStockUpdates($updatedProductIds, $updatedComboIds);
                        
                        // Gửi thông báo cho Admin
                        $adminsToNotify = \App\Models\Admin::where('status', 'active')->get();
                        foreach ($adminsToNotify as $adm) {
                            $adm->notify(new \App\Notifications\AdminAlertNotification(
                                'Đơn hàng mới: #' . $order->order_code,
                                'Khách hàng ' . $order->customer_name . ' vừa đặt đơn hàng trị giá ' . number_format($order->total_amount, 0, ',', '.') . 'đ',
                                'success',
                                '/admin/orders'
                            ));
                        }
                    } catch (\Exception $e) {
                        Log::error("Broadcast/Notification thất bại: " . $e->getMessage());
                    }
                });

                if ($request->payment_method === 'cod') {
                    $cart->items()->delete();
                    $cart->delete();

                    $this->queueOrderSuccessNotifications($order);

                    return response()->json([
                        'success' => true,
                        'message' => 'Đặt hàng thành công!',
                        'data' => [
                            'order_code'   => $order->order_code,
                            'total_amount' => $order->total_amount
                        ]
                    ]);
                }

                if ($request->payment_method === 'momo') {
                    $momoUrl = $this->generateMomoUrl(
                        $order,
                        $request->input('checkout_source', 'web'),
                        $cart->id,
                        $request->input('mobile_return_url')
                    );
                    return response()->json([
                        'success' => true,
                        'payment_url' => $momoUrl,
                        'data' => [
                            'order_code'   => $order->order_code,
                            'total_amount' => $order->total_amount
                        ],
                        'message' => 'Đang chuyển hướng sang Ví MoMo...'
                    ]);
                }

                if ($request->payment_method === 'vnpay') {
                    $vnpayUrl = $this->generateVnpayUrl(
                        $order,
                        $request->input('checkout_source', 'web'),
                        $cart->id,
                        $request->input('mobile_return_url')
                    );

                    return response()->json([
                        'success' => true,
                        'payment_url' => $vnpayUrl,
                        'data' => [
                            'order_code'   => $order->order_code,
                            'total_amount' => $order->total_amount
                        ],
                        'message' => 'Dang chuyen huong sang cong thanh toan VNPay...'
                    ]);
                }

            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        } finally {
            $lock->release();
        }
    }



    private function hasUserReachedCouponLimit(Coupon $coupon, $user): bool
    {
        $limit = (int) ($coupon->usage_limit_per_user ?? 0);
        
        // Block coupons with user quota if not authenticated
        if (!$user) {
            return $limit > 0; // Reject if coupon has per-user limit
        }
        
        if ($limit <= 0) {
            return false;
        }

        return $this->countUserCouponUsage($coupon, (int) $user->id) >= $limit;
    }

    private function countUserCouponUsage(Coupon $coupon, int $userId): int
    {
        return Order::where('user_id', $userId)
            ->where('coupon_id', $coupon->id)
            ->whereNotIn('status', ['cancelled', 'returned'])
            ->count();
    }

    private function generateMomoUrl($order, string $checkoutSource = 'web', ?int $cartId = null, ?string $mobileReturnUrl = null)
    {
        $endpoint = env('MOMO_ENDPOINT');
        $partnerCode = env('MOMO_PARTNER_CODE');
        $accessKey   = env('MOMO_ACCESS_KEY');
        $secretKey   = env('MOMO_SECRET_KEY');

        $missing = [];
        if (empty($endpoint)) $missing[] = 'MOMO_ENDPOINT';
        if (empty($partnerCode)) $missing[] = 'MOMO_PARTNER_CODE';
        if (empty($accessKey)) $missing[] = 'MOMO_ACCESS_KEY';
        if (empty($secretKey)) $missing[] = 'MOMO_SECRET_KEY';
        
        if (!empty($missing)) {
            throw new \Exception('Thiếu cấu hình MoMo: ' . implode(', ', $missing));
        }

        $orderInfo = "Thanh toan don hang SORA " . $order->order_code;
        $amount = (string) round($order->total_amount);
        $orderId = $order->order_code . "_" . time();

        $redirectUrl = $this->paymentCallbackUrl('/api/client/checkout/momo-return');
        $ipnUrl = $this->paymentCallbackUrl('/api/client/checkout/momo-return');

        $extraData = base64_encode(json_encode([
            'source' => $checkoutSource === 'mobile' ? 'mobile' : 'web',
            'cart_id' => $cartId,
            'mobile_return_url' => $this->sanitizeMobileReturnUrl($mobileReturnUrl),
        ]));
        $requestId = time() . "";
        $requestType = env('MOMO_REQUEST_TYPE', 'payWithATM');

        $rawHash = "accessKey=" . $accessKey . "&amount=" . $amount . "&extraData=" . $extraData . "&ipnUrl=" . $ipnUrl . "&orderId=" . $orderId . "&orderInfo=" . $orderInfo . "&partnerCode=" . $partnerCode . "&redirectUrl=" . $redirectUrl . "&requestId=" . $requestId . "&requestType=" . $requestType;

        $signature = hash_hmac("sha256", $rawHash, $secretKey);

        $data = array(
            'partnerCode' => $partnerCode,
            'partnerName' => "SORA Jewelry",
            "storeId"     => "SORA_Store",
            'requestId'   => $requestId,
            'amount'      => (int)$amount,
            'orderId'     => $orderId,
            'orderInfo'   => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl'      => $ipnUrl,
            'lang'        => 'vi',
            'extraData'   => $extraData,
            'requestType' => $requestType,
            'signature'   => $signature
        );

        $response = Http::connectTimeout(5)->timeout(12)->post($endpoint, $data);
        $result = $response->json();

        if (isset($result['payUrl'])) {
            return $result['payUrl'];
        }

        throw new \Exception("MoMo API Error: " . ($result['message'] ?? 'Lỗi tạo link'));
    }

    private function generateVnpayUrl($order, string $checkoutSource = 'web', ?int $cartId = null, ?string $mobileReturnUrl = null): string
    {
        $tmnCode = env('VNPAY_TMN_CODE');
        $hashSecret = env('VNPAY_HASH_SECRET');
        $paymentUrl = env('VNPAY_PAYMENT_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');

        $missing = [];
        if (empty($tmnCode)) $missing[] = 'VNPAY_TMN_CODE';
        if (empty($hashSecret)) $missing[] = 'VNPAY_HASH_SECRET';
        if (empty($paymentUrl)) $missing[] = 'VNPAY_PAYMENT_URL';

        if (!empty($missing)) {
            throw new \Exception('Thieu cau hinh VNPay: ' . implode(', ', $missing));
        }

        $returnParams = [
            'source' => $checkoutSource === 'mobile' ? 'mobile' : 'web',
        ];

        if ($cartId) {
            $returnParams['cart_id'] = $cartId;
        }

        $sanitizedMobileReturnUrl = $this->sanitizeMobileReturnUrl($mobileReturnUrl);
        if ($sanitizedMobileReturnUrl) {
            $returnParams['mobile_return_url'] = $sanitizedMobileReturnUrl;
        }

        $returnUrl = $this->paymentCallbackUrl('/api/client/checkout/vnpay-return') . '?' . http_build_query($returnParams);
        $txnRef = $order->order_code . '_' . time();
        $bankCode = trim((string) env('VNPAY_BANK_CODE', ''));

        $inputData = [
            'vnp_Amount' => (int) round($order->total_amount * 100),
            'vnp_Command' => 'pay',
            'vnp_CreateDate' => now()->format('YmdHis'),
            'vnp_CurrCode' => 'VND',
            'vnp_IpAddr' => request()->ip() ?: '127.0.0.1',
            'vnp_Locale' => 'vn',
            'vnp_OrderInfo' => 'Thanh toan don hang SORA ' . $order->order_code,
            'vnp_OrderType' => 'other',
            'vnp_ReturnUrl' => $returnUrl,
            'vnp_TmnCode' => $tmnCode,
            'vnp_TxnRef' => $txnRef,
            'vnp_Version' => '2.1.0',
        ];

        if ($bankCode !== '') {
            $inputData['vnp_BankCode'] = $bankCode;
        }

        ksort($inputData);

        $hashData = $this->buildVnpayHashData($inputData);
        $query = http_build_query($inputData);
        $secureHash = hash_hmac('sha512', $hashData, $hashSecret);

        return $paymentUrl . '?' . $query . '&vnp_SecureHash=' . $secureHash;
    }

    private function buildVnpayHashData(array $params): string
    {
        ksort($params);

        $hashData = [];
        foreach ($params as $key => $value) {
            if ($value === null || $value === '') {
                continue;
            }

            $hashData[] = urlencode($key) . '=' . urlencode($value);
        }

        return implode('&', $hashData);
    }

    private function paymentCallbackUrl(string $path): string
    {
        $baseUrl = rtrim((string) env('PAYMENT_CALLBACK_BASE_URL', ''), '/');

        if ($baseUrl === '') {
            $baseUrl = rtrim(config('app.url'), '/');
        }

        $requestHost = request()->getHost();
        $configuredHost = parse_url($baseUrl, PHP_URL_HOST);

        if ($requestHost && in_array($configuredHost, ['127.0.0.1', 'localhost'], true) && !in_array($requestHost, ['127.0.0.1', 'localhost'], true)) {
            $baseUrl = rtrim(request()->getSchemeAndHttpHost(), '/');
        }

        return $baseUrl . '/' . ltrim($path, '/');
    }

    public function retryMomoPayment(Request $request, string $order_code)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để tiếp tục thanh toán.',
            ], 401);
        }

        $order = Order::where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng.',
            ], 404);
        }

        if (!$order->user_id || $user->id !== $order->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn không có quyền thanh toán đơn hàng này.',
            ], 403);
        }

        if ($order->payment_method !== 'momo') {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng này không sử dụng phương thức thanh toán MoMo.',
            ], 422);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng này đã được thanh toán.',
            ], 422);
        }

        if ($order->status !== 'pending' || $order->payment_status !== 'unpaid') {
            return response()->json([
                'success' => false,
                'message' => 'Đơn hàng này không còn ở trạng thái chờ thanh toán.',
            ], 422);
        }

        $amount = (int) round($order->total_amount);
        if ($amount < 10000 || $amount > 50000000) {
            return response()->json([
                'success' => false,
                'message' => 'MoMo chỉ hỗ trợ đơn hàng từ 10.000đ đến 50.000.000đ.',
            ], 422);
        }

        try {
            // Find user's cart to persist cart ID across retry attempts
            $userCart = Cart::where('user_id', $user->id)->first();
            $cartId = $userCart ? $userCart->id : null;
            
            $paymentUrl = $this->generateMomoUrl(
                $order,
                $request->input('checkout_source', 'mobile'),
                $cartId,
                $request->input('mobile_return_url')
            );

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'data' => [
                    'order_code' => $order->order_code,
                    'total_amount' => $order->total_amount,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                ],
                'message' => 'Đang mở lại cổng thanh toán MoMo...',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function retryVnpayPayment(Request $request, string $order_code)
    {
        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui long dang nhap de tiep tuc thanh toan.',
            ], 401);
        }

        $order = Order::where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Khong tim thay don hang.',
            ], 404);
        }

        if (!$order->user_id || $user->id !== $order->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Ban khong co quyen thanh toan don hang nay.',
            ], 403);
        }

        if ($order->payment_method !== 'vnpay') {
            return response()->json([
                'success' => false,
                'message' => 'Don hang nay khong su dung phuong thuc thanh toan VNPay.',
            ], 422);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'success' => false,
                'message' => 'Don hang nay da duoc thanh toan.',
            ], 422);
        }

        if ($order->status !== 'pending' || $order->payment_status !== 'unpaid') {
            return response()->json([
                'success' => false,
                'message' => 'Don hang nay khong con o trang thai cho thanh toan.',
            ], 422);
        }

        try {
            // Find user's cart to persist cart ID across retry attempts
            $userCart = Cart::where('user_id', $user->id)->first();
            $cartId = $userCart ? $userCart->id : null;
            
            $paymentUrl = $this->generateVnpayUrl(
                $order,
                $request->input('checkout_source', 'mobile'),
                $cartId,
                $request->input('mobile_return_url')
            );

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'data' => [
                    'order_code' => $order->order_code,
                    'total_amount' => $order->total_amount,
                    'payment_status' => $order->payment_status,
                    'status' => $order->status,
                ],
                'message' => 'Dang mo lai cong thanh toan VNPay...',
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function momoReturn(Request $request)
    {
        $parts = explode('_', $request->orderId);
        $orderCode = $parts[0] ?? '';
        $extraData = json_decode(base64_decode($request->extraData ?? ''), true) ?: [];
        $isMobileCheckout = ($extraData['source'] ?? 'web') === 'mobile';
        $cartId = isset($extraData['cart_id']) ? (int) $extraData['cart_id'] : null;
        $mobileReturnUrl = $extraData['mobile_return_url'] ?? null;

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        if ($request->resultCode == 0) {
            $order = Order::with('items')->where('order_code', $orderCode)->first();
            if ($order) {
                $alreadyPaid = $order->payment_status === 'paid';

                if (!$alreadyPaid) {
                    $order->payment_status = 'paid';
                    $order->save();

                    $this->clearCartAfterPaidOrder($order, $cartId);
                    $this->queueOrderSuccessNotifications($order);
                }
            }

            if ($isMobileCheckout) {
                return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'success', 'order-history'));
            }

            return redirect($frontendUrl . '/checkout/success?order=' . $orderCode);
        }

        $this->cancelOrderAndRestoreStock($orderCode);
        if ($isMobileCheckout) {
            return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'cancelled', 'cart'));
        }

        return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
    }

    public function vnpayReturn(Request $request)
    {
        $hashSecret = env('VNPAY_HASH_SECRET');
        
        // Fail closed: check secret is configured before proceeding
        if (empty($hashSecret)) {
            Log::error('VNPay callback failed: VNPAY_HASH_SECRET is not configured.');
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
            return redirect($frontendUrl . '/checkout/failed?reason=config');
        }
        
        $secureHash = (string) $request->query('vnp_SecureHash', '');
        $inputData = collect($request->query())
            ->filter(fn ($value, $key) => str_starts_with($key, 'vnp_') && !in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType'], true))
            ->all();
        ksort($inputData);

        $calculatedHash = hash_hmac('sha512', $this->buildVnpayHashData($inputData), $hashSecret);

        $parts = explode('_', (string) $request->query('vnp_TxnRef', ''));
        $orderCode = $parts[0] ?? '';
        $isMobileCheckout = $request->query('source', 'web') === 'mobile';
        $cartId = $request->query('cart_id') ? (int) $request->query('cart_id') : null;
        $mobileReturnUrl = $request->query('mobile_return_url');
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        $isPaid = hash_equals($calculatedHash, $secureHash)
            && $request->query('vnp_ResponseCode') === '00'
            && $request->query('vnp_TransactionStatus') === '00';

        if ($isPaid) {
            $order = Order::with('items')->where('order_code', $orderCode)->first();
            if ($order) {
                $alreadyPaid = $order->payment_status === 'paid';

                if (!$alreadyPaid) {
                    $order->payment_status = 'paid';
                    $order->save();

                    $this->clearCartAfterPaidOrder($order, $cartId);
                    $this->queueOrderSuccessNotifications($order);
                }
            }

            if ($isMobileCheckout) {
                return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'success', 'order-history'));
            }

            return redirect($frontendUrl . '/checkout/success?order=' . $orderCode);
        }

        if (!hash_equals($calculatedHash, $secureHash)) {
            Log::warning('VNPay callback signature mismatch.', [
                'order_code' => $orderCode,
                'txn_ref' => $request->query('vnp_TxnRef'),
            ]);
            
            // Do not cancel order on unverified callback to prevent abuse
            if ($isMobileCheckout) {
                return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'cancelled', 'cart'));
            }

            return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
        }

        // Only cancel order after signature verification succeeds
        $this->cancelOrderAndRestoreStock($orderCode);

        if ($isMobileCheckout) {
            return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'cancelled', 'cart'));
        }

        return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
    }

    public function vnpayIpn(Request $request)
    {
        $hashSecret = env('VNPAY_HASH_SECRET');
        $secureHash = (string) $request->query('vnp_SecureHash', '');
        $inputData = collect($request->query())
            ->filter(fn ($value, $key) => str_starts_with($key, 'vnp_') && !in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType'], true))
            ->all();
        ksort($inputData);

        $calculatedHash = hash_hmac('sha512', $this->buildVnpayHashData($inputData), $hashSecret);
        if (!hash_equals($calculatedHash, $secureHash)) {
            return response()->json([
                'RspCode' => '97',
                'Message' => 'Invalid signature',
            ]);
        }

        $parts = explode('_', (string) $request->query('vnp_TxnRef', ''));
        $orderCode = $parts[0] ?? '';
        $order = Order::where('order_code', $orderCode)->first();

        if (!$order) {
            return response()->json([
                'RspCode' => '01',
                'Message' => 'Order not found',
            ]);
        }

        $expectedAmount = (int) round($order->total_amount * 100);
        if ((int) $request->query('vnp_Amount') !== $expectedAmount) {
            return response()->json([
                'RspCode' => '04',
                'Message' => 'Invalid amount',
            ]);
        }

        if ($request->query('vnp_ResponseCode') === '00' && $request->query('vnp_TransactionStatus') === '00') {
            $this->markOnlineOrderAsPaid($orderCode);
        }

        return response()->json([
            'RspCode' => '00',
            'Message' => 'Confirm Success',
        ]);
    }

    private function buildMobileMomoReturnUrl(?string $returnUrl, string $orderCode, string $paymentStatus, string $fallbackPath): string
    {
        return $this->buildMobilePaymentReturnUrl($returnUrl, $orderCode, $paymentStatus, $fallbackPath);
    }

    private function buildMobilePaymentReturnUrl(?string $returnUrl, string $orderCode, string $paymentStatus, string $fallbackPath): string
    {
        $baseUrl = $this->sanitizeMobileReturnUrl($returnUrl) ?: 'sora://' . $fallbackPath;
        $separator = str_contains($baseUrl, '?') ? '&' : '?';

        return $baseUrl . $separator . http_build_query([
            'order' => $orderCode,
            'payment' => $paymentStatus,
        ]);
    }

    private function sanitizeMobileReturnUrl(?string $returnUrl): ?string
    {
        if (!$returnUrl) {
            return null;
        }

        $returnUrl = trim($returnUrl);
        $scheme = strtolower((string) parse_url($returnUrl, PHP_URL_SCHEME));
        $allowedSchemes = collect(explode(',', (string) env('MOBILE_APP_ALLOWED_SCHEMES', 'sora,exp,exps')))
            ->map(fn ($item) => strtolower(trim($item)))
            ->filter()
            ->values()
            ->all();

        if (!in_array($scheme, $allowedSchemes, true)) {
            return null;
        }

        return $returnUrl;
    }

    private function markOnlineOrderAsPaid(string $orderCode): ?Order
    {
        return DB::transaction(function () use ($orderCode) {
            $order = Order::with('items')->where('order_code', $orderCode)->lockForUpdate()->first();
            if (!$order) {
                return null;
            }

            if (in_array($order->status, ['cancelled', 'returned'], true)) {
                Log::warning('Skip marking online order as paid because order is no longer payable.', [
                    'order_code' => $orderCode,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                ]);

                return $order;
            }

            if ($order->payment_status !== 'paid') {
                $order->payment_status = 'paid';
                $order->save();

                $this->clearCartAfterPaidOrder($order);
                $this->queueOrderSuccessNotifications($order);
            }

            return $order;
        });
    }

    private function clearCartAfterPaidOrder(Order $order, ?int $cartId = null): void
    {
        $cart = $cartId ? Cart::find($cartId) : null;

        if (!$cart && $order->user_id) {
            $cart = Cart::where('user_id', $order->user_id)->first();
        }

        if ($cart) {
            $cart->items()->delete();
            $cart->delete();
        }
    }

    private function queueOrderSuccessNotifications(Order $order): void
    {
        SendOrderSuccessNotificationsJob::dispatch($order->id);
    }

    private function cancelOrderAndRestoreStock($orderCode)
    {
        DB::transaction(function () use ($orderCode) {
            $order = Order::with('items')->where('order_code', $orderCode)->lockForUpdate()->first();

            if (!$order || $order->status === 'cancelled') {
                return; // Idempotent check
            }

            if ($order->status === 'pending' && $order->payment_status === 'unpaid') {
                $order->update(['status' => 'cancelled', 'payment_status' => 'failed']);

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
            }
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

        // Kiểm tra xem coupon có vừa chạm mức limit trước khi rollback không
        $wasAtLimit = ($coupon->usage_limit !== null && $coupon->usage_count == $coupon->usage_limit);

        if ((int) $coupon->usage_count > 0) {
            $coupon->decrement('usage_count');
            $coupon->refresh();
        }

        // Chỉ khôi phục trạng thái nếu coupon vừa bị khóa/xóa tự động do chạm limit
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

    public function getLocations(Request $request)
    {
        try {
            $apiPath = $request->query('api_path', 'p/');
            $depth = $request->query('depth', 1);

            $response = Http::get("https://provinces.open-api.vn/api/{$apiPath}", [
                'depth' => $depth
            ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            Log::error("Lỗi lấy địa giới hành chính: " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Lỗi kết nối máy chủ tỉnh thành.'], 500);
        }
    }

    private function resolveCart(Request $request)
    {
        $user = auth('sanctum')->user();
        if ($user && $user instanceof \App\Models\User) return Cart::with(['items.variant', 'items.combo'])->where('user_id', $user->id)->first();

        $sessionId = $request->header('X-Cart-Session-Id');
        if ($sessionId) return Cart::with(['items.variant', 'items.combo'])->where('session_id', $sessionId)->first();

        return null;
    }
}
