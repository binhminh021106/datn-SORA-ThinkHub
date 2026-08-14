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
use App\Models\PaymentAttempt;
use App\Http\Requests\Client\Checkout\UserCheckoutRequest;
use App\Jobs\SendOrderSuccessNotificationsJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use App\Events\NewOrderReceived;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Database\QueryException;

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

        $coupons = Coupon::where('status', 'active')
            ->where(function ($q) use ($user) {
                $q->where(function ($subQ) {
                    $subQ->whereNull('user_id')
                         ->where('name', 'NOT LIKE', '%sinh nhật%');
                });

                if ($user) {
                    $q->orWhere('user_id', $user->id);
                }
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
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

        $idempotencyKey = trim((string) ($request->header('Idempotency-Key') ?: $request->input('idempotency_key', '')));
        if ($idempotencyKey === '') {
            $idempotencyKey = (string) Str::uuid();
        }
        if (strlen($idempotencyKey) > 100) {
            return response()->json(['success' => false, 'message' => 'Idempotency key không hợp lệ.'], 422);
        }

        $existingOrder = Order::where('idempotency_key', $idempotencyKey)->first();
        if ($existingOrder) {
            if ((int) $existingOrder->user_id !== (int) $user->id) {
                return response()->json(['success' => false, 'message' => 'Idempotency key không hợp lệ.'], 409);
            }

            return $this->buildIdempotentCheckoutResponse($existingOrder);
        }

        $lockKey = 'checkout_lock_' . ($user ? $user->id : $sessionId);
        // This covers the longest gateway request timeout plus database work.
        // The route also holds the shared cart mutation lock.
        $lock = Cache::lock($lockKey, 60);

        if (!$lock->get()) {
            return response()->json([
                'success' => false,
                'message' => 'Hệ thống đang xử lý đơn hàng của bạn, vui lòng không bấm liên tục...'
            ], 429);
        }

        $existingOrder = Order::where('idempotency_key', $idempotencyKey)->first();
        if ($existingOrder) {
            $lock->release();
            if ((int) $existingOrder->user_id !== (int) $user->id) {
                return response()->json(['success' => false, 'message' => 'Idempotency key không hợp lệ.'], 409);
            }

            return $this->buildIdempotentCheckoutResponse($existingOrder);
        }

        // CHỐNG SPAM: Kiểm tra tài khoản có bị cấm đặt hàng không
        if ($user->is_order_blocked) {
            $lock->release();
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản của bạn đã bị hạn chế chức năng đặt hàng do dấu hiệu bất thường. Vui lòng liên hệ Admin.'
            ], 403);
        }

        // CHỐNG GĂM HÀNG: Kiểm tra khoảng cách thời gian đặt đơn (Cooldown)
        $cooldownSetting = \App\Models\Setting::where('key', 'order_cooldown_minutes')->first();
        $cooldownMinutes = $cooldownSetting ? (int)$cooldownSetting->value : 0;

        if ($cooldownMinutes > 0) {
            $latestOrder = \App\Models\Order::where('user_id', $user->id)
                ->whereNotIn('status', ['cancelled', 'returned'])
                ->orderBy('created_at', 'desc')
                ->first();

            if ($latestOrder && now()->diffInMinutes($latestOrder->created_at, true) < $cooldownMinutes) {
                $lock->release();
                return response()->json([
                    'success' => false,
                    'message' => 'Bạn thao tác đặt hàng quá nhanh. Vui lòng chờ ' . $cooldownMinutes . ' phút trước khi đặt đơn tiếp theo.'
                ], 429);
            }
        }

        try {
            $checkoutResult = DB::transaction(function () use ($request, $cart, $user, $idempotencyKey) {

                $customerName = $request->customer_name;
                $customerPhone = $request->customer_phone;
                $customerAddress = $request->customer_address;

                if ($request->user_address_id && $user) {
                    $address = UserAddress::where('user_id', $user->id)->find($request->user_address_id);
                    if (! $address) {
                        throw new \DomainException('Địa chỉ giao hàng không thuộc tài khoản của bạn.');
                    }

                    $customerName = $address->customer_name;
                    $customerPhone = $address->customer_phone;
                    $customerAddress = collect([
                        $address->shipping_address,
                        $address->ward,
                        $address->district,
                        $address->city,
                    ])->filter()->implode(', ');
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
                        if (! $variant || ! $variant->product || $variant->product->status !== 'published') {
                            throw new \DomainException('Sản phẩm này không còn kinh doanh.');
                        }
                        if ($variant->stock_quantity < $item->quantity) {
                            throw new \DomainException("Sản phẩm SKU {$variant->sku} không đủ số lượng.");
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
                        if (! $combo || $combo->status !== 'active'
                            || ($combo->start_date && $combo->start_date->isFuture())
                            || ($combo->end_date && $combo->end_date->isPast())) {
                            throw new \DomainException("Combo không tồn tại hoặc đã ngừng kinh doanh.");
                        }

                        if ($combo->usage_limit !== null) {
                            if ($combo->usage_limit < $item->quantity) {
                                throw new \DomainException("Gói ưu đãi {$combo->name} đã vượt quá số lượt bán cho phép.");
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
                                        throw new \DomainException("Một sản phẩm tự chọn trong bộ {$combo->name} đã hết hàng.");
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
                                    throw new \DomainException("Sản phẩm cố định trong bộ {$combo->name} đã hết hàng.");
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
                        throw new \DomainException("Mã giảm giá không hợp lệ hoặc đã tạm ngưng sử dụng.");
                    }
                    if (str_contains(mb_strtolower($coupon->name, 'UTF-8'), 'sinh nhật') && is_null($coupon->user_id)) {
                        throw new \DomainException("Mã giảm giá sinh nhật này đã cũ và không còn hợp lệ.");
                    }
                    if ($coupon->user_id && (!$user || (int) $user->id !== (int) $coupon->user_id)) {
                        throw new \DomainException("Mã giảm giá này không thuộc quyền sở hữu của bạn.");
                    }
                    if ($coupon->expires_at && now()->greaterThan($coupon->expires_at)) {
                        throw new \DomainException("Mã giảm giá đã hết hạn.");
                    }
                    if ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
                        throw new \DomainException("Mã giảm giá đã hết lượt sử dụng.");
                    }
                    if ($this->hasUserReachedCouponLimit($coupon, $user)) {
                        throw new \DomainException("Bạn đã sử dụng hết lượt cho mã giảm giá này.");
                    }
                    if ($subTotal < $coupon->min_spend) {
                        throw new \DomainException("Đơn hàng chưa đạt giá trị tối thiểu (" . number_format($coupon->min_spend, 0, ',', '.') . "đ) để áp dụng mã giảm giá này.");
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

                $shippingFee = $this->calculateShippingFee($subTotal);
                $totalAmount = max($subTotal - $discountAmount - $tierDiscountAmount, 0) + $shippingFee;

                if ($request->payment_method === 'momo' && ($totalAmount < 10000 || $totalAmount > 50000000)) {
                    throw new \DomainException("Thanh toán qua ví MoMo chỉ hỗ trợ giao dịch từ 10.000đ đến 50.000.000đ.");
                }
                
                if ($request->payment_method === 'vnpay' && ($totalAmount < 10000 || $totalAmount > 1000000000)) {
                    throw new \DomainException("Thanh toán qua VNPay chỉ hỗ trợ giao dịch từ 10.000đ đến 1.000.000.000đ.");
                }

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
                    'idempotency_key'      => $idempotencyKey,
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
                    $attempt = $this->startPaymentAttempt(
                        $order,
                        'momo',
                        $cart,
                        $request->input('checkout_source', 'web'),
                        $request->input('mobile_return_url')
                    );
                    return ['payment_attempt_id' => $attempt->id];
                }

                if ($request->payment_method === 'vnpay') {
                    $attempt = $this->startPaymentAttempt(
                        $order,
                        'vnpay',
                        $cart,
                        $request->input('checkout_source', 'web'),
                        $request->input('mobile_return_url')
                    );
                    return ['payment_attempt_id' => $attempt->id];
                }

            });

            if (! is_array($checkoutResult) || ! isset($checkoutResult['payment_attempt_id'])) {
                return $checkoutResult;
            }

            $attempt = PaymentAttempt::with('order')->findOrFail($checkoutResult['payment_attempt_id']);
            $order = $attempt->order;
            if (! $order) {
                throw new \RuntimeException('Payment attempt is missing its order.');
            }

            $paymentUrl = $attempt->gateway === 'momo'
                ? $this->generateMomoUrl($order, $attempt)
                : $this->generateVnpayUrl($order, $attempt);

            return response()->json([
                'success' => true,
                'payment_url' => $paymentUrl,
                'data' => [
                    'order_code' => $order->order_code,
                    'total_amount' => $order->total_amount,
                ],
                'message' => $attempt->gateway === 'momo'
                    ? 'Dang chuyen huong sang MoMo...'
                    : 'Dang chuyen huong sang cong thanh toan VNPay...',
            ]);
        } catch (\DomainException $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        } catch (QueryException $e) {
            if ($this->isIdempotencyKeyCollision($e)) {
                $existingOrder = Order::where('idempotency_key', $idempotencyKey)->first();

                if ($existingOrder && (int) $existingOrder->user_id === (int) $user->id) {
                    return $this->buildIdempotentCheckoutResponse($existingOrder);
                }
            }

            report($e);
            return response()->json(['success' => false, 'message' => 'Khong the xu ly thanh toan luc nay. Vui long thu lai sau.'], 500);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['success' => false, 'message' => 'Không thể xử lý thanh toán lúc này. Vui lòng thử lại sau.'], 500);
        } finally {
            $lock->release();
        }
    }

    private function isIdempotencyKeyCollision(QueryException $exception): bool
    {
        return in_array((string) $exception->getCode(), ['23000', '23505'], true)
            && str_contains(strtolower($exception->getMessage()), 'idempotency_key');
    }



    private function hasUserReachedCouponLimit(Coupon $coupon, $user): bool
    {
        $limit = (int) ($coupon->usage_limit_per_user ?? 0);
        
        // Block coupons with user quota if not authenticated
        if (! $user instanceof \App\Models\User) {
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

    private function buildIdempotentCheckoutResponse(Order $order)
    {
        $response = [
            'success' => true,
            'idempotent_replay' => true,
            'message' => 'Yêu cầu đặt hàng này đã được xử lý trước đó.',
            'data' => [
                'order_code' => $order->order_code,
                'total_amount' => $order->total_amount,
                'payment_status' => $order->payment_status,
            ],
        ];

        if ($order->payment_status !== 'paid' && in_array($order->payment_method, ['momo', 'vnpay'], true)) {
            // An idempotent replay must not create a second provider payment
            // reference/link. The customer can deliberately retry from their
            // order history if the original payment session has expired.
            $response['payment_pending'] = true;
            $response['message'] = 'Đơn hàng đang chờ thanh toán. Vui lòng kiểm tra lại trong Đơn mua của tôi.';
        }

        return response()->json($response);
    }

    private function calculateShippingFee(float $subTotal): int
    {
        // Shipping rules are authoritative on the server. The client value is never trusted.
        return $subTotal > 500000 ? 0 : 30000;
    }

    private function startPaymentAttempt(Order $order, string $gateway, ?Cart $cart, string $checkoutSource, ?string $mobileReturnUrl): PaymentAttempt
    {
        $previousAttempt = PaymentAttempt::where('order_id', $order->id)
            ->where('gateway', $gateway)
            ->latest('id')
            ->lockForUpdate()
            ->first();

        if ($previousAttempt && $previousAttempt->status === 'pending') {
            if (! $previousAttempt->expires_at || $previousAttempt->expires_at->isFuture()) {
                throw new \DomainException('Cong thanh toan hien tai van con hieu luc. Vui long hoan tat hoac cho het han truoc khi thu lai.');
            }

            $previousAttempt->update(['status' => 'expired']);
        }

        $snapshot = $cart ? $this->buildCartSnapshot($cart) : $previousAttempt?->cart_snapshot;
        $referenceSuffix = now()->format('YmdHis') . Str::upper(Str::random(10));

        return PaymentAttempt::create([
            'order_id' => $order->id,
            'gateway' => $gateway,
            'merchant_reference' => $order->order_code . '_' . $referenceSuffix,
            'gateway_request_id' => $gateway === 'momo' ? $referenceSuffix : null,
            'amount' => (int) round($order->total_amount),
            'status' => 'pending',
            'cart_snapshot' => $snapshot,
            'checkout_source' => $checkoutSource === 'mobile' ? 'mobile' : 'web',
            'mobile_return_url' => $this->sanitizeMobileReturnUrl($mobileReturnUrl),
            'expires_at' => now()->addMinutes(max(1, (int) config('payment.attempt_ttl_minutes', 15))),
        ]);
    }

    private function buildCartSnapshot(Cart $cart): array
    {
        $cart->loadMissing('items');

        return [
            'cart_id' => (int) $cart->id,
            'items' => $cart->items->map(fn ($item) => [
                'id' => (int) $item->id,
                'product_variant_id' => $item->product_variant_id ? (int) $item->product_variant_id : null,
                'combo_id' => $item->combo_id ? (int) $item->combo_id : null,
                'combo_selections' => $item->combo_selections,
                'quantity' => (int) $item->quantity,
            ])->values()->all(),
        ];
    }

    private function generateMomoUrl(Order $order, PaymentAttempt $attempt): string
    {
        $endpoint = config('payment.momo.endpoint');
        $partnerCode = config('payment.momo.partner_code');
        $accessKey   = config('payment.momo.access_key');
        $secretKey   = config('payment.momo.secret_key');

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
        $orderId = $attempt->merchant_reference;

        $redirectUrl = $this->paymentCallbackUrl('/api/client/checkout/momo-return');
        $ipnUrl = $this->paymentCallbackUrl('/api/client/checkout/momo-ipn');

        $extraData = base64_encode(json_encode([
            'source' => $attempt->checkout_source,
            'mobile_return_url' => $attempt->mobile_return_url,
        ]));
        $requestId = $attempt->gateway_request_id;
        $requestType = config('payment.momo.request_type', 'payWithATM');

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

    private function generateVnpayUrl(Order $order, PaymentAttempt $attempt): string
    {
        $tmnCode = config('payment.vnpay.tmn_code');
        $hashSecret = config('payment.vnpay.hash_secret');
        $paymentUrl = config('payment.vnpay.payment_url', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html');

        $missing = [];
        if (empty($tmnCode)) $missing[] = 'VNPAY_TMN_CODE';
        if (empty($hashSecret)) $missing[] = 'VNPAY_HASH_SECRET';
        if (empty($paymentUrl)) $missing[] = 'VNPAY_PAYMENT_URL';

        if (!empty($missing)) {
            throw new \Exception('Thieu cau hinh VNPay: ' . implode(', ', $missing));
        }

        $returnParams = [
            'source' => $attempt->checkout_source,
        ];

        $sanitizedMobileReturnUrl = $attempt->mobile_return_url;
        if ($sanitizedMobileReturnUrl) {
            $returnParams['mobile_return_url'] = $sanitizedMobileReturnUrl;
        }

        $returnUrl = $this->paymentCallbackUrl('/api/client/checkout/vnpay-return') . '?' . http_build_query($returnParams);
        $txnRef = $attempt->merchant_reference;
        $bankCode = trim((string) config('payment.vnpay.bank_code', ''));

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
        $baseUrl = rtrim((string) config('payment.callback_base_url', ''), '/');
        if ($baseUrl === '' && app()->environment('local', 'testing')) {
            $baseUrl = rtrim((string) config('app.url'), '/');
        }

        $scheme = strtolower((string) parse_url($baseUrl, PHP_URL_SCHEME));
        $host = parse_url($baseUrl, PHP_URL_HOST);
        $requiresHttps = ! app()->environment('local', 'testing');

        if (! $host || ($requiresHttps && $scheme !== 'https') || (! $requiresHttps && ! in_array($scheme, ['http', 'https'], true))) {
            throw new \RuntimeException('PAYMENT_CALLBACK_BASE_URL must be configured as a valid public callback URL.');
        }

        return $baseUrl . '/' . ltrim($path, '/');
    }

    public function retryMomoPayment(Request $request, string $order_code)
    {
        $user = auth('sanctum')->user();
        if (! $user instanceof \App\Models\User) {
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

        $retryLock = Cache::lock('payment_retry:momo:' . $order->id, 30);
        if (!$retryLock->get()) {
            return response()->json(['success' => false, 'message' => 'Đơn hàng đang được mở lại cổng thanh toán.'], 429);
        }

        try {
            // tìm giỏ hàng của người dùng để giữ lại ID giỏ hàng trong các lần thử lại
            $attempt = DB::transaction(function () use ($order, $request) {
                $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

                return $this->startPaymentAttempt(
                    $lockedOrder,
                    'momo',
                    null,
                    $request->input('checkout_source', 'mobile'),
                    $request->input('mobile_return_url')
                );
            });

            $paymentUrl = $this->generateMomoUrl($order, $attempt);

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
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 409);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Không thể mở lại cổng thanh toán lúc này. Vui lòng thử lại sau.',
            ], 400);
        } finally {
            $retryLock->release();
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

        $retryLock = Cache::lock('payment_retry:vnpay:' . $order->id, 30);
        if (!$retryLock->get()) {
            return response()->json(['success' => false, 'message' => 'Đơn hàng đang được mở lại cổng thanh toán.'], 429);
        }

        try {
            // tìm giỏ hàng của người dùng để giữ lại ID giỏ hàng trong các lần thử lại
            $attempt = DB::transaction(function () use ($order, $request) {
                $lockedOrder = Order::whereKey($order->id)->lockForUpdate()->firstOrFail();

                return $this->startPaymentAttempt(
                    $lockedOrder,
                    'vnpay',
                    null,
                    $request->input('checkout_source', 'mobile'),
                    $request->input('mobile_return_url')
                );
            });

            $paymentUrl = $this->generateVnpayUrl($order, $attempt);

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
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 409);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => 'Không thể mở lại cổng thanh toán lúc này. Vui lòng thử lại sau.',
            ], 400);
        } finally {
            $retryLock->release();
        }
    }

    public function momoReturn(Request $request)
    {
        $orderId = trim((string) $request->input('orderId', ''));
        $parts = explode('_', $orderId, 2);
        $orderCode = trim((string) ($parts[0] ?? ''));
        $decodedExtraData = base64_decode((string) $request->input('extraData', ''), true);
        $extraData = is_string($decodedExtraData) ? json_decode($decodedExtraData, true) : [];
        $extraData = is_array($extraData) ? $extraData : [];
        $isMobileCheckout = ($extraData['source'] ?? 'web') === 'mobile';
        $cartId = isset($extraData['cart_id']) ? (int) $extraData['cart_id'] : null;
        $mobileReturnUrl = $extraData['mobile_return_url'] ?? null;

        $frontendUrl = rtrim((string) config('payment.frontend_url', 'http://localhost:5173'), '/');

        // Verify the gateway signature before performing an order lookup so
        // arbitrary browser traffic cannot turn this public endpoint into a
        // database-probing endpoint.
        $hasValidGatewaySignature = $this->verifyMomoCallbackSignature($request)
            && (string) $request->input('partnerCode') === (string) config('payment.momo.partner_code')
            && $orderId !== '';

        if (! $hasValidGatewaySignature) {
            Log::warning('MoMo browser return rejected before order lookup.', [
                'order_code' => $orderCode,
                'result_code' => $request->input('resultCode'),
            ]);

            if ($isMobileCheckout) {
                return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
            }

            return redirect($frontendUrl . '/checkout/failed?order=' . urlencode($orderCode));
        }

        // Use server-side order data for every business check after the
        // signature has established that the gateway payload is authentic.
        $order = $orderCode !== '' ? Order::where('order_code', $orderCode)->first() : null;

        $isValidCallback = $order
            && str_starts_with($orderId, $orderCode . '_')
            && (string) $request->input('orderInfo') === "Thanh toan don hang SORA {$orderCode}"
            && is_numeric($request->input('amount'))
            && (int) $request->input('amount') === (int) round($order->total_amount)
            && $order->payment_method === 'momo'
            && !in_array($order->status, ['cancelled', 'returned'], true);

        if (!$isValidCallback) {
            Log::warning('MoMo callback rejected.', [
                'order_code' => $orderCode,
                'result_code' => $request->input('resultCode'),
            ]);

            if ($isMobileCheckout) {
                return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
            }

            return redirect($frontendUrl . '/checkout/failed?order=' . urlencode($orderCode));
        }

        if ((int) $request->input('resultCode') === 0) {
            $paidOrder = $this->markOnlineOrderAsPaid($orderCode, 'momo', $orderId);
            if (! $paidOrder) {
                Log::warning('MoMo browser return could not settle the order.', [
                    'order_code' => $orderCode,
                    'result_code' => $request->input('resultCode'),
                ]);

                if ($isMobileCheckout) {
                    return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
                }

                return redirect($frontendUrl . '/checkout/failed?order=' . urlencode($orderCode));
            }

            if ($isMobileCheckout) {
                return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'success', 'order-history'));
            }

            return redirect($frontendUrl . '/checkout/success?order=' . $orderCode);
        }

        // Browser returns are user-agent traffic and can race the provider's
        // IPN. A verified IPN performs cancellation for a failed payment; the
        // browser return only renders the outcome.
        if ($isMobileCheckout) {
            return redirect($this->buildMobileMomoReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
        }

        return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
    }

    private function verifyMomoCallbackSignature(Request $request): bool
    {
        $secretKey = (string) config('payment.momo.secret_key', '');
        $accessKey = (string) config('payment.momo.access_key', '');
        $signature = (string) $request->input('signature', '');

        if ($secretKey === '' || $accessKey === '' || $signature === '') {
            return false;
        }

        $rawHash = 'accessKey=' . $accessKey
            . '&amount=' . (string) $request->input('amount', '')
            . '&extraData=' . (string) $request->input('extraData', '')
            . '&message=' . (string) $request->input('message', '')
            . '&orderId=' . (string) $request->input('orderId', '')
            . '&orderInfo=' . (string) $request->input('orderInfo', '')
            . '&orderType=' . (string) $request->input('orderType', '')
            . '&partnerCode=' . (string) $request->input('partnerCode', '')
            . '&payType=' . (string) $request->input('payType', '')
            . '&requestId=' . (string) $request->input('requestId', '')
            . '&responseTime=' . (string) $request->input('responseTime', '')
            . '&resultCode=' . (string) $request->input('resultCode', '')
            . '&transId=' . (string) $request->input('transId', '');

        $expectedSignature = hash_hmac('sha256', $rawHash, $secretKey);

        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Server-to-server MoMo notification. This endpoint intentionally has no
     * browser redirect: a valid notification is acknowledged with 204 after
     * its idempotent settlement work completes.
     */
    public function momoIpn(Request $request)
    {
        $orderId = trim((string) $request->input('orderId', ''));
        $orderCode = trim((string) (explode('_', $orderId, 2)[0] ?? ''));

        $hasValidGatewaySignature = $this->verifyMomoCallbackSignature($request)
            && (string) $request->input('partnerCode') === (string) config('payment.momo.partner_code')
            && $orderId !== '';

        if (! $hasValidGatewaySignature) {
            Log::warning('MoMo IPN signature or partner validation failed.', [
                'order_code' => $orderCode,
                'result_code' => $request->input('resultCode'),
            ]);

            return response()->json(['message' => 'Invalid payment notification.'], 400);
        }

        $order = $orderCode !== '' ? Order::where('order_code', $orderCode)->first() : null;
        $isValidOrder = $order
            && str_starts_with($orderId, $orderCode . '_')
            && (string) $request->input('orderInfo') === "Thanh toan don hang SORA {$orderCode}"
            && is_numeric($request->input('amount'))
            && (int) $request->input('amount') === (int) round($order->total_amount)
            && $order->payment_method === 'momo'
            && ! in_array($order->status, ['cancelled', 'returned'], true);

        if (! $isValidOrder) {
            Log::warning('MoMo IPN rejected because the order data is invalid.', [
                'order_code' => $orderCode,
                'result_code' => $request->input('resultCode'),
            ]);

            return response()->noContent(204);
        }

        try {
            if ((int) $request->input('resultCode') === 0) {
                $decodedExtraData = base64_decode((string) $request->input('extraData', ''), true);
                $extraData = is_string($decodedExtraData) ? json_decode($decodedExtraData, true) : [];
                $extraData = is_array($extraData) ? $extraData : [];
                $cartId = isset($extraData['cart_id']) ? (int) $extraData['cart_id'] : null;
                $paidOrder = $this->markOnlineOrderAsPaid($orderCode, 'momo', $orderId);

                if (! $paidOrder) {
                    Log::warning('MoMo IPN could not settle an otherwise valid order.', [
                        'order_code' => $orderCode,
                    ]);

                    return response()->json(['message' => 'Order is no longer payable.'], 409);
                }
            } else {
                $this->cancelOrderAndRestoreStock($orderCode, 'momo', $orderId);
            }
        } catch (\Throwable $e) {
            report($e);
            Log::error('MoMo IPN settlement failed.', ['order_code' => $orderCode]);

            return response()->json(['message' => 'Temporary payment processing failure.'], 500);
        }

        return response()->noContent(204);
    }

    public function vnpayReturn(Request $request)
    {
        $hashSecret = config('payment.vnpay.hash_secret');
        
        // thông báo lỗi nếu chưa cấu hình VNPAY_HASH_SECRET để tránh lỗi không rõ ràng
        if (empty($hashSecret)) {
            Log::error('VNPay callback failed: VNPAY_HASH_SECRET is not configured.');
            $frontendUrl = rtrim((string) config('payment.frontend_url', 'http://localhost:5173'), '/');
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
        $mobileReturnUrl = $request->query('mobile_return_url');
        $frontendUrl = rtrim((string) config('payment.frontend_url', 'http://localhost:5173'), '/');

        $isPaid = hash_equals($calculatedHash, $secureHash)
            && $request->query('vnp_TmnCode') === config('payment.vnpay.tmn_code')
            && $request->query('vnp_ResponseCode') === '00'
            && $request->query('vnp_TransactionStatus') === '00';

        if ($isPaid) {
            $order = Order::where('order_code', $orderCode)->first();
            $expectedAmount = $order ? (int) round($order->total_amount * 100) : null;
            if (!$order || $order->payment_method !== 'vnpay' || (int) $request->query('vnp_Amount') !== $expectedAmount) {
                Log::warning('VNPay return rejected because the order or amount is invalid.', [
                    'order_code' => $orderCode,
                    'payment_method' => $order?->payment_method,
                    'received_amount' => $request->query('vnp_Amount'),
                    'expected_amount' => $expectedAmount,
                ]);

                if ($isMobileCheckout) {
                    return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
                }

                return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
            }

            $paidOrder = $this->markOnlineOrderAsPaid($orderCode, 'vnpay', (string) $request->query('vnp_TxnRef', ''));
            if (!$paidOrder) {
                if ($isMobileCheckout) {
                    return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
                }

                return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
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
            
            // An unverified browser return must never mutate order state.
            if ($isMobileCheckout) {
                return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
            }

            return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
        }

        // A gateway IPN is authoritative for failed/cancelled payments. Do
        // not let a browser return race it and cancel a paid order.

        if ($isMobileCheckout) {
            return redirect($this->buildMobilePaymentReturnUrl($mobileReturnUrl, $orderCode, 'failed', 'cart'));
        }

        return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
    }

    public function vnpayIpn(Request $request)
    {
        $hashSecret = (string) config('payment.vnpay.hash_secret', '');
        $tmnCode = (string) config('payment.vnpay.tmn_code', '');

        if ($hashSecret === '' || $tmnCode === '') {
            Log::error('VNPay IPN rejected because payment credentials are not configured.');

            return response()->json([
                'RspCode' => '99',
                'Message' => 'Payment configuration error',
            ]);
        }

        $secureHash = (string) $request->query('vnp_SecureHash', '');
        $inputData = collect($request->query())
            ->filter(fn ($value, $key) => str_starts_with($key, 'vnp_') && !in_array($key, ['vnp_SecureHash', 'vnp_SecureHashType'], true))
            ->all();
        ksort($inputData);

        $calculatedHash = hash_hmac('sha512', $this->buildVnpayHashData($inputData), $hashSecret);
        if ($request->query('vnp_TmnCode') !== $tmnCode || $secureHash === '' || !hash_equals($calculatedHash, $secureHash)) {
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

        if ($order->payment_method !== 'vnpay') {
            return response()->json([
                'RspCode' => '02',
                'Message' => 'Invalid payment method',
            ]);
        }

        if ($order->payment_status === 'paid') {
            return response()->json([
                'RspCode' => '02',
                'Message' => 'Order already confirmed',
            ]);
        }

        if ($order->status !== 'pending' || $order->payment_status !== 'unpaid') {
            return response()->json([
                'RspCode' => '02',
                'Message' => 'Order is no longer payable',
            ]);
        }

        $expectedAmount = (int) round($order->total_amount * 100);
        if ((int) $request->query('vnp_Amount') !== $expectedAmount) {
            return response()->json([
                'RspCode' => '04',
                'Message' => 'Invalid amount',
            ]);
        }

        try {
            if ($request->query('vnp_ResponseCode') === '00' && $request->query('vnp_TransactionStatus') === '00') {
                $paidOrder = $this->markOnlineOrderAsPaid($orderCode, 'vnpay', (string) $request->query('vnp_TxnRef', ''));
                if (! $paidOrder) {
                    return response()->json([
                        'RspCode' => '02',
                        'Message' => 'Order is no longer payable',
                    ]);
                }
            } else {
                $this->cancelOrderAndRestoreStock($orderCode, 'vnpay', (string) $request->query('vnp_TxnRef', ''));
            }
        } catch (\Throwable $e) {
            report($e);
            Log::error('VNPay IPN settlement failed.', ['order_code' => $orderCode]);

            return response()->json([
                'RspCode' => '99',
                'Message' => 'Temporary processing error',
            ]);
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
        $allowedSchemes = collect(config('payment.mobile_allowed_schemes', []))
            ->map(fn ($item) => strtolower(trim($item)))
            ->filter()
            ->values()
            ->all();

        if (!in_array($scheme, $allowedSchemes, true)) {
            return null;
        }

        return $returnUrl;
    }

    private function markOnlineOrderAsPaid(string $orderCode, string $expectedPaymentMethod, string $merchantReference): ?Order
    {
        return DB::transaction(function () use ($orderCode, $expectedPaymentMethod, $merchantReference) {
            $order = Order::with('items')->where('order_code', $orderCode)->lockForUpdate()->first();
            if (!$order) {
                return null;
            }

            if ($order->payment_method !== $expectedPaymentMethod) {
                Log::warning('Payment callback method does not match the order.', [
                    'order_code' => $orderCode,
                    'expected_payment_method' => $expectedPaymentMethod,
                    'actual_payment_method' => $order->payment_method,
                ]);

                return null;
            }

            $attempt = PaymentAttempt::where('merchant_reference', $merchantReference)
                ->where('gateway', $expectedPaymentMethod)
                ->lockForUpdate()
                ->first();

            if (! $attempt || (int) $attempt->order_id !== (int) $order->id) {
                Log::warning('Payment callback does not match a known payment attempt.', [
                    'order_code' => $orderCode,
                    'gateway' => $expectedPaymentMethod,
                ]);

                return null;
            }

            if ($attempt->status === 'succeeded' && $order->payment_status === 'paid') {
                return $order;
            }

            if (! in_array($attempt->status, ['pending', 'superseded'], true)) {
                Log::warning('Ignoring a non-active payment attempt callback.', [
                    'order_code' => $orderCode,
                    'gateway' => $expectedPaymentMethod,
                    'attempt_status' => $attempt->status,
                ]);

                return null;
            }

            if ($order->payment_status === 'paid') {
                $attempt->update([
                    'status' => 'succeeded',
                    'completed_at' => now(),
                ]);

                return $order;
            }

            if (in_array($order->status, ['cancelled', 'returned'], true)) {
                Log::warning('Skip marking online order as paid because order is no longer payable.', [
                    'order_code' => $orderCode,
                    'status' => $order->status,
                    'payment_status' => $order->payment_status,
                ]);

                return null;
            }

            if ($order->payment_status !== 'paid') {
                $order->payment_status = 'paid';
                $order->save();

                $attempt->update([
                    'status' => 'succeeded',
                    'completed_at' => now(),
                ]);

                PaymentAttempt::where('order_id', $order->id)
                    ->where('gateway', $expectedPaymentMethod)
                    ->where('status', 'pending')
                    ->where('id', '!=', $attempt->id)
                    ->update(['status' => 'superseded']);

                $this->clearCartAfterPaidOrder($order, $attempt->cart_snapshot);
                $this->queueOrderSuccessNotifications($order);
            }

            return $order;
        });
    }

    private function clearCartAfterPaidOrder(Order $order, ?array $snapshot): void
    {
        if (! $order->user_id || ! is_array($snapshot) || empty($snapshot['cart_id']) || empty($snapshot['items'])) {
            return;
        }

        $cart = Cart::whereKey((int) $snapshot['cart_id'])
            ->where('user_id', $order->user_id)
            ->lockForUpdate()
            ->first();

        if (! $cart) {
            return;
        }

        $cartItems = \App\Models\CartItem::where('cart_id', $cart->id)->lockForUpdate()->get()->keyBy('id');

        foreach ($snapshot['items'] as $snapshotItem) {
            $cartItem = $cartItems->get((int) ($snapshotItem['id'] ?? 0));

            if (! $cartItem) {
                continue;
            }

            if ((int) $cartItem->product_variant_id !== (int) ($snapshotItem['product_variant_id'] ?? 0)
                || (int) $cartItem->combo_id !== (int) ($snapshotItem['combo_id'] ?? 0)
                || $cartItem->combo_selections != ($snapshotItem['combo_selections'] ?? null)) {
                continue;
            }

            $remainingQuantity = (int) $cartItem->quantity - (int) ($snapshotItem['quantity'] ?? 0);
            if ($remainingQuantity > 0) {
                $cartItem->update(['quantity' => $remainingQuantity]);
                continue;
            }

            $cartItem->delete();
            $cartItems->forget((int) $cartItem->id);
        }

        if ($cartItems->isEmpty()) {
            $cart->delete();
        }
    }

    private function queueOrderSuccessNotifications(Order $order): void
    {
        SendOrderSuccessNotificationsJob::dispatch($order->id)->afterCommit();
    }

    private function cancelOrderAndRestoreStock(string $orderCode, string $gateway, string $merchantReference): void
    {
        DB::transaction(function () use ($orderCode, $gateway, $merchantReference) {
            $order = Order::with('items')->where('order_code', $orderCode)->lockForUpdate()->first();

            $attempt = PaymentAttempt::where('merchant_reference', $merchantReference)
                ->where('gateway', $gateway)
                ->lockForUpdate()
                ->first();

            if (! $attempt || ! $order || (int) $attempt->order_id !== (int) $order->id || $attempt->status !== 'pending') {
                return;
            }

            if ($order->status === 'cancelled') {
                return; // Idempotent check
            }

            if ($order->status === 'pending' && $order->payment_status === 'unpaid') {
                $attempt->update(['status' => 'failed']);
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
