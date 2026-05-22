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
use App\Models\Admin;
use App\Models\TierServiceUsage;
use App\Models\MembershipTier;
use App\Http\Requests\UserCheckoutRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use App\Events\NewOrderReceived;
use App\Mail\OrderPlacedMail;
use App\Mail\AdminNewOrderMail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ClientCheckoutController extends Controller
{
    public function initData(Request $request)
    {
        $cart = $this->resolveCart($request);
        $cartItems = $cart ? $cart->items->load(['variant.product', 'combo']) : [];

        $addresses = [];
        $userData = null;
        $tierDiscountInfo = null;

        $user = auth('sanctum')->user();
        if ($user) {
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
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereColumn('usage_count', '<', 'usage_limit');
            })
            ->where(function ($q) use ($user) {
                $q->where('type', '!=', 'birthday');

                if ($user && $this->isSilverTierOrAbove($user)) {
                    $q->orWhere(function ($birthday) use ($user) {
                        $birthday->where('type', 'birthday')
                            ->where('user_id', $user->id)
                            ->where('is_used', 0);
                    });
                }
            })
            ->get();

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
        if (!$user) {
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
                        $customerAddress = $address->shipping_address . ', ' . $address->ward . ', ' . $address->district . ', ' . $address->city;
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
                $orderItemsData = [];

                foreach ($cart->items as $item) {
                    if ($item->product_variant_id) {
                        $variant = $variants->get($item->product_variant_id);
                        if (!$variant || $variant->stock_quantity < $item->quantity) {
                            throw new \Exception("Sản phẩm SKU {$variant->sku} không đủ số lượng.");
                        }

                        $variant->stock_quantity -= $item->quantity;
                        $variant->save();

                        $itemTotal = $item->subtotal;
                        $subTotal += $itemTotal;

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
                    if ($coupon->type === 'birthday') {
                        if ((int) $coupon->user_id !== (int) $user->id || !$this->isSilverTierOrAbove($user)) {
                            throw new \Exception("Voucher chỉ dành cho thành viên hạng Bạc trở lên.");
                        }
                        if ($coupon->is_used) {
                            throw new \Exception("Mã voucher sinh nhật đã được sử dụng.");
                        }
                    }
                    if ($coupon->expires_at && now()->greaterThan($coupon->expires_at)) {
                        throw new \Exception("Mã giảm giá đã hết hạn.");
                    }
                    if ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
                        throw new \Exception("Mã giảm giá đã hết lượt sử dụng.");
                    }
                    if ($subTotal < $coupon->min_spend) {
                        throw new \Exception("Đơn hàng chưa đạt giá trị tối thiểu (" . number_format($coupon->min_spend, 0, ',', '.') . "đ) để áp dụng mã giảm giá này.");
                    }

                    $discountAmount = ($coupon->type === 'fixed') ? $coupon->value : ($subTotal * ($coupon->value / 100));
                    $couponId = $coupon->id;
                    $coupon->increment('usage_count');
                    if ($coupon->type === 'birthday') {
                        $coupon->is_used = 1;
                        $coupon->save();
                    }
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
                        } elseif ($usedCount >= $maxLimit && $maxLimit > 0) {
                            // Tuỳ chọn: Báo lỗi nếu user cố tình ép gửi request xài quá lượt (hoặc có thể bỏ qua và áp mức giảm = 0)
                            // throw new \Exception("Bạn đã sử dụng hết lượt giảm giá của Hạng thành viên trong năm nay.");
                        }
                    }
                }

                $shippingFee = (int) $request->shipping_fee;

                $totalAmount = max($subTotal - $discountAmount - $tierDiscountAmount + $shippingFee, 0);

                $order = Order::create([
                    'order_code'           => 'SORA' . strtoupper(Str::random(8)),
                    'user_id'              => $user->id ?? null,
                    'customer_name'        => $customerName,
                    'customer_phone'       => $customerPhone,
                    'customer_email'       => $request->customer_email,
                    'customer_address'     => $customerAddress,
                    'order_note'           => $request->order_note,
                    'sub_total'            => $subTotal,
                    'shipping_fee'         => $shippingFee,
                    'discount_amount'      => $discountAmount,
                    'tier_discount_amount' => $tierDiscountAmount,
                    'total_amount'         => $totalAmount,
                    'coupon_id'            => $couponId,
                    'coupon_code'          => $request->coupon_code,
                    'payment_method'       => $request->payment_method,
                    'payment_status'       => 'unpaid',
                    'status'               => 'pending',
                ]);

                foreach ($orderItemsData as $itemData) {
                    $itemData['order_id'] = $order->id;
                    $itemData['total_price'] = $itemData['price'] * $itemData['quantity'];
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
                    'note'            => 'Khách hàng khởi tạo đơn hàng',
                    'changed_by'      => $user->id ?? null,
                    'changed_by_type' => $user ? 'user' : 'guest',
                ]);

                try {
                    broadcast(new NewOrderReceived($order->order_code, (float) $order->total_amount));
                } catch (\Exception $e) {
                    Log::error("Broadcast Reverb thất bại: " . $e->getMessage());
                }

                if ($request->payment_method === 'cod') {
                    $cart->items()->delete();
                    $cart->delete();

                    $this->sendOrderConfirmationEmail($order);

                    return response()->json([
                        'success' => true,
                        'data' => $order,
                        'message' => 'Đặt hàng thành công!'
                    ]);
                }

                if ($request->payment_method === 'momo') {
                    $momoUrl = $this->generateMomoUrl($order);
                    return response()->json([
                        'success' => true,
                        'payment_url' => $momoUrl,
                        'message' => 'Đang chuyển hướng sang Ví MoMo...'
                    ]);
                }
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        } finally {
            $lock->release();
        }
    }

    private function isSilverTierOrAbove($user): bool
    {
        if (!$user || !$user->tier_id) {
            return false;
        }

        $userTier = $user->relationLoaded('tier') ? $user->tier : MembershipTier::find($user->tier_id);
        if (!$userTier) {
            return false;
        }

        $silverTier = MembershipTier::orderBy('min_spent', 'asc')
            ->get()
            ->first(function ($tier) {
                $tierName = Str::lower(Str::ascii($tier->name ?? ''));
                return Str::contains($tierName, ['silver', 'bac']);
            });

        if (!$silverTier) {
            return false;
        }

        return (float) $userTier->min_spent >= (float) $silverTier->min_spent;
    }

    private function generateMomoUrl($order)
    {
        // Lấy thông tin từ file .env
        $endpoint = env('MOMO_ENDPOINT');
        $partnerCode = env('MOMO_PARTNER_CODE');
        $accessKey   = env('MOMO_ACCESS_KEY');
        $secretKey   = env('MOMO_SECRET_KEY');

        // Validate required environment variables
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

        // Sử dụng hàm url() của Laravel để tự động lấy domain hiện tại (APP_URL)
        $redirectUrl = url('/api/client/checkout/momo-return');
        $ipnUrl = url('/api/client/checkout/momo-return');

        $extraData = "";
        $requestId = time() . "";
        $requestType = "payWithATM";

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

        $response = Http::post($endpoint, $data);
        $result = $response->json();

        if (isset($result['payUrl'])) {
            return $result['payUrl'];
        }

        throw new \Exception("MoMo API Error: " . ($result['message'] ?? 'Lỗi tạo link'));
    }

    public function momoReturn(Request $request)
    {
        $parts = explode('_', $request->orderId);
        $orderCode = $parts[0] ?? '';

        $frontendUrl = 'http://localhost:5173';

        if ($request->resultCode == 0) {
            Order::where('order_code', $orderCode)->update(['payment_status' => 'paid']);

            $order = Order::with('items')->where('order_code', $orderCode)->first();
            if ($order) {
                $this->sendOrderConfirmationEmail($order);
            }

            return redirect($frontendUrl . '/checkout/success?order=' . $orderCode);
        }

        $this->cancelOrderAndRestoreStock($orderCode);
        return redirect($frontendUrl . '/checkout/failed?order=' . $orderCode);
    }

    private function sendOrderConfirmationEmail($order)
    {
        try {
            $order->load('items');

            if (!empty($order->customer_email)) {
                Mail::to($order->customer_email)->send(new OrderPlacedMail($order));
            }

            $adminEmailsEnv = env('ADMIN_ORDER_NOTIFICATION_EMAIL');
            $adminEmailsToNotify = [];

            if (!empty($adminEmailsEnv)) {
                $adminEmailsToNotify = array_map('trim', explode(',', $adminEmailsEnv));
                $adminEmailsToNotify = array_filter($adminEmailsToNotify);
            } else {
                $adminEmailsToNotify = Admin::where('role_id', 1)
                    ->where('status', 'active')
                    ->pluck('email')
                    ->toArray();
            }

            if (!empty($adminEmailsToNotify)) {
                Mail::to($adminEmailsToNotify)->send(new AdminNewOrderMail($order));
            }
        } catch (\Exception $e) {
            Log::error('Lỗi gửi mail xác nhận đơn hàng ' . $order->order_code . ': ' . $e->getMessage());
        }
    }

    private function cancelOrderAndRestoreStock($orderCode)
    {
        $order = Order::with('items')->where('order_code', $orderCode)->first();

        if ($order && $order->status === 'pending' && $order->payment_status === 'unpaid') {
            $order->update(['status' => 'cancelled', 'payment_status' => 'failed']);

            TierServiceUsage::where('order_id', $order->id)
                ->where('service_type', 'tier_discount')
                ->delete();

            foreach ($order->items as $item) {
                if ($item->product_variant_id) {
                    ProductVariant::where('id', $item->product_variant_id)->increment('stock_quantity', $item->quantity);
                } elseif ($item->combo_id) {
                    Combo::where('id', $item->combo_id)
                        ->whereNotNull('usage_limit')
                        ->increment('usage_limit', $item->quantity);

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
        if ($user) return Cart::with(['items.variant', 'items.combo'])->where('user_id', $user->id)->first();

        $sessionId = $request->header('X-Cart-Session-Id');
        if ($sessionId) return Cart::with(['items.variant', 'items.combo'])->where('session_id', $sessionId)->first();

        return null;
    }
}
