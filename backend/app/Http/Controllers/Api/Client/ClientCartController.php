<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\Client\Cart\UserStoreCartItemRequest;
use App\Http\Requests\Client\Cart\UserUpdateCartItemRequest;
use App\Models\Coupon;
use App\Models\MembershipTier;
use App\Models\Combo;

class ClientCartController extends Controller
{
    private const MAX_CART_LINES = 50;
    private const MAX_CART_TOTAL_QUANTITY = 200;

    public function index(Request $request)
    {
        $cart = $this->resolveCart($request);

        if (!$cart) {
            return response()->json([
                'success' => true, 
                'data' => [],
                'summary' => ['total_items' => 0, 'subtotal' => 0]
            ]);
        }

        // TỐI ƯU ORM: Eager load toàn bộ items và các quan hệ từ đầu
        // Tránh lỗi N+1 khi truy cập các thuộc tính ảo (accessor) tính giá
        $cart->load([
            'items.variant.product', 
            'items.variant.attributeValues.attribute', 
            'items.combo.items.variant'
        ]);

        return response()->json([
            'success' => true,
            'data' => $cart->items,
            'summary' => [
                'total_items' => $cart->items->sum('quantity'),
                'subtotal'    => $cart->items->sum('subtotal') // Đảm bảo model CartItem đã có accessor getSubtotalAttribute()
            ]
        ]);
    }

    public function store(UserStoreCartItemRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $cart = $this->resolveCart($request, true);
                $cart = $this->lockCart($cart);

                $variant = ProductVariant::with('product')
                    ->whereKey($request->product_variant_id)
                    ->whereHas('product', fn ($query) => $query->where('status', 'published'))
                    ->lockForUpdate()
                    ->first();

                if (!$variant) {
                    throw new \DomainException('Sản phẩm này hiện không còn kinh doanh.');
                }

                $cartItem = CartItem::firstOrNew([
                    'cart_id'            => $cart->id,
                    'product_variant_id' => $variant->id,
                ]);

                $newQuantity = $cartItem->quantity + $request->quantity;

                if ($newQuantity > $variant->stock_quantity) {
                    throw new \DomainException('Số lượng yêu cầu vượt quá tồn kho hiện có.');
                }

                $this->assertCartCapacity(
                    $cart,
                    (int) $newQuantity,
                    ! $cartItem->exists,
                    (int) ($cartItem->quantity ?? 0)
                );

                $cartItem->quantity = $newQuantity;
                $cartItem->save();

                $cart->load('items');
                $totalItems = $cart->items->sum('quantity');
                return response()->json([
                    'success'    => true,
                    'message'    => 'Đã thêm sản phẩm vào giỏ hàng.',
                    'data' => $cartItem->load(['variant.product', 'variant.attributeValues.attribute']),
                    'session_id' => $request->header('X-Cart-Session-Id'),
                    'cart_count' => $totalItems,
]);
            });
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Không thể thêm sản phẩm vào giỏ hàng lúc này. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function addCombo(Request $request)
    {
        $request->validate([
            'combo_id' => 'required|exists:combos,id',
            'quantity' => 'required|integer|min:1|max:100',
            'combo_selections' => 'required|array|max:20',
            'combo_selections.*.combo_item_id' => 'required|integer',
            'combo_selections.*.selected_variant_id' => 'required|integer',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $cart = $this->resolveCart($request, true);
                $cart = $this->lockCart($cart);
                [$combo, $comboSelections] = $this->validatedComboSelections(
                    (int) $request->combo_id,
                    (int) $request->quantity,
                    $request->input('combo_selections', [])
                );

                $variantIds = array_column($comboSelections, 'selected_variant_id');
                $variantsInCombo = ProductVariant::whereIn('id', $variantIds)->lockForUpdate()->get();

                // Lưu luôn giá variant vào combo_selections để tránh N+1 query ở accessor
                $existingItem = CartItem::where('cart_id', $cart->id)
                    ->where('combo_id', $request->combo_id)
                    ->get()
                    ->first(function ($item) use ($comboSelections) {
                        return $item->combo_selections == $comboSelections;
                    });

                $newQuantity = $existingItem ? $existingItem->quantity + $request->quantity : $request->quantity;

                if ($combo->usage_limit !== null && $newQuantity > $combo->usage_limit) {
                    throw new \DomainException("Combo này chỉ còn tối đa {$combo->usage_limit} lượt sử dụng.");
                }

                $this->assertCartCapacity(
                    $cart,
                    (int) $newQuantity,
                    ! $existingItem,
                    (int) ($existingItem?->quantity ?? 0)
                );

                foreach ($variantsInCombo as $v) {
                    if ($newQuantity > $v->stock_quantity) {
                        throw new \DomainException('Một sản phẩm thuộc combo không còn đủ số lượng trong kho.');
                    }
                }

                if ($existingItem) {
                    $existingItem->update(['quantity' => $newQuantity]);
                    $cartItem = $existingItem;
                } else {
                    $cartItem = CartItem::create([
                        'cart_id'          => $cart->id,
                        'combo_id'         => $request->combo_id,
                        'combo_selections' => $comboSelections,
                        'quantity'         => $request->quantity
                    ]);
                }

                return response()->json([
                    'success'    => true,
                    'message'    => 'Đã thêm Combo vào giỏ hàng.',
                    'data'       => $cartItem->load('combo'),
                    'session_id' => $request->header('X-Cart-Session-Id') 
                ]);
            });
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Không thể thêm combo vào giỏ hàng lúc này. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function update(UserUpdateCartItemRequest $request, $id)
    {
        try {
            return DB::transaction(function () use ($request, $id) {
        $cart = $this->resolveCart($request);
        
        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng đã hết hạn hoặc không tồn tại.'], 403);
        }

        $cart = $this->lockCart($cart);

        $cartItem = CartItem::where('cart_id', $cart->id)->lockForUpdate()->find($id);

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm này không nằm trong giỏ hàng của bạn.'], 404);
        }

        if ($cartItem->product_variant_id) {
            $variant = ProductVariant::with('product')
                ->whereKey($cartItem->product_variant_id)
                ->lockForUpdate()
                ->first();

            if (!$variant || !$variant->product || $variant->product->status !== 'published') {
                return response()->json(['success' => false, 'message' => 'Sản phẩm này hiện không còn kinh doanh.'], 422);
            }

            if ((int) $request->quantity > (int) $variant->stock_quantity) {
                return response()->json(['success' => false, 'message' => 'Số lượng vượt quá tồn kho hiện có.'], 422);
            }
        } elseif ($cartItem->combo_id) {
            $combo = Combo::with('items')->whereKey($cartItem->combo_id)->lockForUpdate()->first();
            if (!$combo || $combo->status !== 'active') {
                return response()->json(['success' => false, 'message' => 'Combo này hiện không còn hiệu lực.'], 422);
            }

            if ($combo->usage_limit !== null && (int) $request->quantity > (int) $combo->usage_limit) {
                return response()->json(['success' => false, 'message' => 'Combo này không còn đủ lượt sử dụng.'], 422);
            }

            $requiredQuantities = [];
            foreach ($combo->items as $comboItem) {
                if ($comboItem->product_variant_id) {
                    $variantId = (int) $comboItem->product_variant_id;
                    $requiredQuantities[$variantId] = ($requiredQuantities[$variantId] ?? 0)
                        + ((int) $request->quantity * max((int) $comboItem->quantity, 1));
                }
            }

            foreach (is_array($cartItem->combo_selections) ? $cartItem->combo_selections : [] as $selection) {
                $variantId = (int) ($selection['selected_variant_id'] ?? 0);
                if ($variantId) {
                    $requiredQuantities[$variantId] = ($requiredQuantities[$variantId] ?? 0) + (int) $request->quantity;
                }
            }

            $variants = ProductVariant::with('product')
                ->whereIn('id', array_keys($requiredQuantities))
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            foreach ($requiredQuantities as $variantId => $requiredQuantity) {
                $variant = $variants->get($variantId);
                if (!$variant || !$variant->product || $variant->product->status !== 'published' || $requiredQuantity > (int) $variant->stock_quantity) {
                    return response()->json(['success' => false, 'message' => 'Một sản phẩm trong combo hiện không đủ hàng.'], 422);
                }
            }
        }

        $this->assertCartCapacity($cart, (int) $request->quantity, false, (int) $cartItem->quantity);
        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật số lượng thành công.',
            'data'    => $cartItem
        ]);
            });
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Không thể cập nhật giỏ hàng lúc này. Vui lòng thử lại sau.',
            ], 500);
        }
    }

    public function destroy(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
        $cart = $this->resolveCart($request);

        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng trống.'], 403);
        }

        $cart = $this->lockCart($cart);

        $cartItem = CartItem::where('cart_id', $cart->id)->lockForUpdate()->find($id);

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm cần xóa.'], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.'
        ]);
        });
    }

    public function clear(Request $request)
    {
        return DB::transaction(function () use ($request) {
        $cart = $this->resolveCart($request);

        if ($cart) {
            $cart = $this->lockCart($cart);
            $cart->items()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Giỏ hàng đã được làm trống.'
        ]);
        });
    }

    public function mergeCart(Request $request)
    {
        $sessionId = $request->header('X-Cart-Session-Id');
        $user = auth('sanctum')->user();

        if (!$sessionId || !$user || !($user instanceof \App\Models\User)) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], 400);
        }

        // TỐI ƯU ORM: Load sẵn item của guest để tránh N+1 khi gọi $guestCart->items
        $guestCart = Cart::with('items')->where('session_id', $sessionId)->first();
        
        if (!$guestCart || $guestCart->items->isEmpty()) {
            return response()->json([
                'success' => true, 
                'message' => 'Không có dữ liệu để hợp nhất.',
                'clear_session' => true
            ]);
        }

        try {
            return DB::transaction(function () use ($guestCart, $user) {
            $lockedGuestCart = Cart::with('items')->whereKey($guestCart->id)->lockForUpdate()->first();
            if (! $lockedGuestCart || $lockedGuestCart->items->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Không có dữ liệu để hợp nhất.',
                    'clear_session' => true,
                ]);
            }

            $userCart = $this->lockCart(Cart::firstOrCreate(['user_id' => $user->id]));
            
            // Load and lock current items once so merge decisions and capacity
            // checks are made against a stable cart snapshot.
            $userItems = CartItem::where('cart_id', $userCart->id)->lockForUpdate()->get();

            foreach ($lockedGuestCart->items as $guestItem) {
                if ($guestItem->combo_id) {
                    // Tìm kiếm trên Collection thay vì Query Builder
                    $userItem = $userItems->where('combo_id', $guestItem->combo_id)
                                          ->first(function ($item) use ($guestItem) {
                                              return $item->combo_selections == $guestItem->combo_selections;
                                          });

                    $nextQuantity = ($userItem ? (int) $userItem->quantity : 0) + (int) $guestItem->quantity;
                    $this->assertCartCapacity($userCart, $nextQuantity, ! $userItem, (int) ($userItem?->quantity ?? 0));

                    if ($userItem) {
                        $userItem->update(['quantity' => $nextQuantity]);
                    } else {
                        $newItem = $guestItem->replicate();
                        $newItem->cart_id = $userCart->id;
                        $newItem->save();
                        $userItems->push($newItem);
                    }
                } 
                else {
                    $userItem = collect($userItems)->where('product_variant_id', $guestItem->product_variant_id)->first();

                    $nextQuantity = ($userItem ? (int) $userItem->quantity : 0) + (int) $guestItem->quantity;
                    $this->assertCartCapacity($userCart, $nextQuantity, ! $userItem, (int) ($userItem?->quantity ?? 0));

                    if ($userItem) {
                        $userItem->update(['quantity' => $nextQuantity]);
                    } else {
                        $newItem = $guestItem->replicate();
                        $newItem->cart_id = $userCart->id;
                        $newItem->save();
                        $userItems->push($newItem);
                    }
                }
            }

            $lockedGuestCart->items()->delete();
            $lockedGuestCart->delete();

            return response()->json([
                'success' => true, 
                'message' => 'Đã đồng bộ giỏ hàng vào tài khoản của bạn.',
                'clear_session' => true
            ]);
            });
        } catch (\DomainException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'success' => false,
                'message' => 'Không thể hợp nhất giỏ hàng lúc này. Vui lòng thử lại sau.',
            ], 500);
        }
    }

public function applyBirthdayCoupon(Request $request)
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100'],
        ]);
        $code = strtoupper(trim($validated['code']));
        if (!$code) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã voucher.']);
        }

        $user = auth('sanctum')->user();
        if (!$user || !($user instanceof \App\Models\User)) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để sử dụng voucher.']);
        }

        // Tìm mã voucher đang Active
        $coupon = Coupon::where('code', $code)->where('status', 'active')->first();

        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Mã voucher không hợp lệ hoặc đã bị vô hiệu hóa.']);
        }

        // Kiểm tra quyền sở hữu (Nếu là mã cá nhân)
        if ($coupon->user_id && $coupon->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Mã voucher này không thuộc quyền sở hữu của bạn.']);
        }

        // Kiểm tra hạn sử dụng
        if ($coupon->expires_at && now()->greaterThan($coupon->expires_at)) {
            return response()->json(['success' => false, 'message' => 'Mã voucher đã hết hạn sử dụng.']);
        }

        // Kiểm tra lượt dùng
        if ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
            return response()->json(['success' => false, 'message' => 'Mã voucher đã hết lượt sử dụng.']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Áp dụng ưu đãi thành công!',
            'coupon' => $coupon->code
        ]);
    }


    private function resolveCart(Request $request, $createIfNotFound = false)
    {
        $user = auth('sanctum')->user();

        if ($user && $user instanceof \App\Models\User) {
            return $createIfNotFound 
                ? Cart::firstOrCreate(['user_id' => $user->id]) 
                : Cart::where('user_id', $user->id)->first();
        }

        $sessionId = $request->header('X-Cart-Session-Id');
        
        if (!$sessionId && $createIfNotFound) {
            $sessionId = Str::uuid()->toString();
            $request->headers->set('X-Cart-Session-Id', $sessionId);
        } elseif (!$sessionId) {
            return null; 
        }

        return $createIfNotFound 
            ? Cart::firstOrCreate(['session_id' => $sessionId]) 
            : Cart::where('session_id', $sessionId)->first();
    }

    /**
     * Serialize aggregate cart checks even if the cache lock is temporarily
     * unavailable on another process. Every caller already runs in a DB
     * transaction before requesting this row lock.
     */
    private function lockCart(Cart $cart): Cart
    {
        return Cart::whereKey($cart->id)->lockForUpdate()->firstOrFail();
    }

    private function assertCartCapacity(
        Cart $cart,
        int $nextLineQuantity,
        bool $isNewLine,
        int $currentLineQuantity = 0
    ): void {
        $summary = CartItem::where('cart_id', $cart->id)
            ->selectRaw('COUNT(*) as line_count, COALESCE(SUM(quantity), 0) as total_quantity')
            ->first();

        $lineCount = (int) ($summary->line_count ?? 0);
        $totalQuantity = (int) ($summary->total_quantity ?? 0);

        if ($isNewLine && $lineCount >= self::MAX_CART_LINES) {
            throw new \DomainException('Giỏ hàng chỉ hỗ trợ tối đa ' . self::MAX_CART_LINES . ' mặt hàng khác nhau.');
        }

        $newTotalQuantity = $totalQuantity - max(0, $currentLineQuantity) + $nextLineQuantity;
        if ($newTotalQuantity > self::MAX_CART_TOTAL_QUANTITY) {
            throw new \DomainException('Tổng số lượng sản phẩm trong giỏ hàng không được vượt quá ' . self::MAX_CART_TOTAL_QUANTITY . '.');
        }
    }

    /**
     * Build combo selections exclusively from database data. Prices and extra
     * fields supplied by the browser are never persisted as trusted values.
     */
    private function validatedComboSelections(int $comboId, int $quantity, array $selections): array
    {
        $now = now();
        $combo = Combo::with('items')
            ->whereKey($comboId)
            ->where('status', 'active')
            ->where(function ($query) use ($now) {
                $query->whereNull('start_date')->orWhere('start_date', '<=', $now);
            })
            ->where(function ($query) use ($now) {
                $query->whereNull('end_date')->orWhere('end_date', '>=', $now);
            })
            ->lockForUpdate()
            ->first();

        if (! $combo) {
            throw new \DomainException('Combo không tồn tại hoặc hiện không còn hiệu lực.');
        }

        $customItems = $combo->items
            ->filter(fn ($item) => empty($item->product_variant_id))
            ->keyBy('id');

        if ($customItems->count() !== count($selections)) {
            throw new \DomainException('Lựa chọn của combo không đầy đủ hoặc không hợp lệ.');
        }

        $selectionMap = [];
        foreach ($selections as $selection) {
            $comboItemId = (int) ($selection['combo_item_id'] ?? 0);
            $variantId = (int) ($selection['selected_variant_id'] ?? 0);

            if (! $comboItemId || ! $variantId || ! $customItems->has($comboItemId) || isset($selectionMap[$comboItemId])) {
                throw new \DomainException('Lựa chọn của combo không hợp lệ.');
            }

            $selectionMap[$comboItemId] = $variantId;
        }

        $variants = ProductVariant::with('product')
            ->whereIn('id', array_values($selectionMap))
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        $normalizedSelections = [];
        foreach ($customItems as $comboItemId => $comboItem) {
            $variantId = $selectionMap[$comboItemId] ?? null;
            $variant = $variantId ? $variants->get($variantId) : null;

            if (! $variant || (int) $variant->product_id !== (int) $comboItem->product_id) {
                throw new \DomainException('Biến thể được chọn không thuộc sản phẩm của combo.');
            }

            if (! $variant->product || $variant->product->status !== 'published' || $variant->stock_quantity < $quantity) {
                throw new \DomainException('Một sản phẩm được chọn trong combo hiện không đủ hàng.');
            }

            $normalizedSelections[] = [
                'combo_item_id' => (int) $comboItemId,
                'selected_variant_id' => (int) $variant->id,
                'price' => $variant->promotional_price ?: $variant->price,
                'product_name' => $variant->product->name,
                'attributes' => $variant->attributes,
            ];
        }

        return [$combo, $normalizedSelections];
    }
}
