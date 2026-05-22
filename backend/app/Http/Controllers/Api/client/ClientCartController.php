<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Http\Requests\UserStoreCartItemRequest;
use App\Http\Requests\UserUpdateCartItemRequest;
use App\Models\Coupon;
use App\Models\MembershipTier;

class ClientCartController extends Controller
{
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

        return response()->json([
            'success' => true,
            'data' => $cart->items->load(['variant', 'combo']),
            'summary' => [
                'total_items' => $cart->items->sum('quantity'),
                'subtotal'    => $cart->items->sum('subtotal') 
            ]
        ]);
    }

    public function store(UserStoreCartItemRequest $request)
    {
        try {
            return DB::transaction(function () use ($request) {
                $cart = $this->resolveCart($request, true);

                $variant = ProductVariant::lockForUpdate()->findOrFail($request->product_variant_id);

                $cartItem = CartItem::firstOrNew([
                    'cart_id'            => $cart->id,
                    'product_variant_id' => $variant->id,
                ]);

                $newQuantity = $cartItem->quantity + $request->quantity;

                if ($newQuantity > $variant->stock_quantity) {
                    throw new \Exception("Số lượng yêu cầu vượt quá tồn kho hiện có.");
                }

                $cartItem->quantity = $newQuantity;
                $cartItem->save();

                return response()->json([
                    'success'    => true,
                    'message'    => 'Đã thêm sản phẩm vào giỏ hàng.',
                    'data'       => $cartItem->load('variant'),
                    'session_id' => $request->header('X-Cart-Session-Id')
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    public function addCombo(Request $request)
    {
        $request->validate([
            'combo_id' => 'required|exists:combos,id',
            'quantity' => 'required|integer|min:1',
            'combo_selections' => 'array'
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $cart = $this->resolveCart($request, true);

                // FIX LỖI BLIND SPOT: Kiểm tra tồn kho của từng item trong Combo (và khóa dòng)
                $variantIds = array_column($request->combo_selections, 'selected_variant_id');
                $variantsInCombo = ProductVariant::whereIn('id', $variantIds)->lockForUpdate()->get();

                $existingItem = CartItem::where('cart_id', $cart->id)
                    ->where('combo_id', $request->combo_id)
                    ->get()
                    ->first(function ($item) use ($request) {
                        return $item->combo_selections == $request->combo_selections;
                    });

                $newQuantity = $existingItem ? $existingItem->quantity + $request->quantity : $request->quantity;

                // Cảnh báo nếu số lượng tổng vượt quá kho của bất kỳ biến thể nào
                foreach ($variantsInCombo as $v) {
                    if ($newQuantity > $v->stock_quantity) {
                        throw new \Exception("Sản phẩm thuộc combo (ID: {$v->id}) chỉ còn tối đa {$v->stock_quantity} chiếc trong kho.");
                    }
                }

                if ($existingItem) {
                    $existingItem->update(['quantity' => $newQuantity]);
                    $cartItem = $existingItem;
                } else {
                    $cartItem = CartItem::create([
                        'cart_id'          => $cart->id,
                        'combo_id'         => $request->combo_id,
                        'combo_selections' => $request->combo_selections,
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
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Sửa lỗi IDOR & Route Binding: Không nhận inject trực tiếp CartItem nữa
     * Sử dụng thẳng param $id và verify nó thuộc về user hiện tại
     */
    public function update(UserUpdateCartItemRequest $request, $id)
    {
        $cart = $this->resolveCart($request);
        
        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng đã hết hạn hoặc không tồn tại.'], 403);
        }

        // CHỐNG IDOR: CartItem phải nằm trong giỏ của chính User/Session này
        $cartItem = CartItem::where('cart_id', $cart->id)->find($id);

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Sản phẩm này không nằm trong giỏ hàng của bạn.'], 404);
        }

        $cartItem->update(['quantity' => $request->quantity]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật số lượng thành công.',
            'data'    => $cartItem
        ]);
    }

    /**
     * Sửa lỗi IDOR
     */
    public function destroy(Request $request, $id)
    {
        $cart = $this->resolveCart($request);

        if (!$cart) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng trống.'], 403);
        }

        // CHỐNG IDOR
        $cartItem = CartItem::where('cart_id', $cart->id)->find($id);

        if (!$cartItem) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy sản phẩm cần xóa.'], 404);
        }

        $cartItem->delete();

        return response()->json([
            'success' => true, 
            'message' => 'Đã xóa sản phẩm khỏi giỏ hàng.'
        ]);
    }

    public function clear(Request $request)
    {
        $cart = $this->resolveCart($request);

        if ($cart) {
            $cart->items()->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Giỏ hàng đã được làm trống.'
        ]);
    }

    public function mergeCart(Request $request)
    {
        $sessionId = $request->header('X-Cart-Session-Id');
        $user = auth('sanctum')->user();

        if (!$sessionId || !$user) {
            return response()->json(['success' => false, 'message' => 'Dữ liệu không hợp lệ.'], 400);
        }

        $guestCart = Cart::where('session_id', $sessionId)->first();
        
        if (!$guestCart || $guestCart->items->isEmpty()) {
            return response()->json([
                'success' => true, 
                'message' => 'Không có dữ liệu để hợp nhất.',
                'clear_session' => true
            ]);
        }

        return DB::transaction(function () use ($guestCart, $user) {
            $userCart = Cart::firstOrCreate(['user_id' => $user->id]);

            foreach ($guestCart->items as $guestItem) {
                if ($guestItem->combo_id) {
                    $userItem = CartItem::where('cart_id', $userCart->id)
                        ->where('combo_id', $guestItem->combo_id)
                        ->get()
                        ->first(function ($item) use ($guestItem) {
                            return $item->combo_selections == $guestItem->combo_selections;
                        });

                    if ($userItem) {
                        $userItem->increment('quantity', $guestItem->quantity);
                    } else {
                        $newItem = $guestItem->replicate();
                        $newItem->cart_id = $userCart->id;
                        $newItem->save();
                    }
                } 
                else {
                    $userItem = CartItem::firstOrNew([
                        'cart_id'            => $userCart->id,
                        'product_variant_id' => $guestItem->product_variant_id,
                    ]);

                    $userItem->quantity += $guestItem->quantity;
                    $userItem->save();
                }
            }

            // Xoá giỏ hàng rác sau khi đồng bộ
            $guestCart->items()->delete();
            $guestCart->delete();

            return response()->json([
                'success' => true, 
                'message' => 'Đã đồng bộ giỏ hàng vào tài khoản của bạn.',
                'clear_session' => true // FE dựa vào cờ này để xóa Session ID ở LocalStorage
            ]);
        });
    }

    public function applyBirthdayCoupon(Request $request)
    {
        $code = $request->input('code');
        if (!$code) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy mã voucher.']);
        }

        $user = auth('sanctum')->user();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Bạn cần đăng nhập để sử dụng voucher sinh nhật.']);
        }

        if (!$this->isSilverTierOrAbove($user)) {
            return response()->json(['success' => false, 'message' => 'Voucher chỉ dành cho thành viên hạng Bạc trở lên.']);
        }

        $coupon = Coupon::where('code', $code)
            ->where('type', 'birthday')
            ->where('status', 'active')
            ->where('user_id', $user->id)
            ->where('is_used', 0)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->where(function ($q) {
                $q->whereNull('usage_limit')->orWhereColumn('usage_count', '<', 'usage_limit');
            })
            ->first();

        if (!$coupon) {
            return response()->json(['success' => false, 'message' => 'Mã voucher không hợp lệ hoặc đã hết hạn.']);
        }

        return response()->json([
            'success' => true,
            'message' => 'Áp dụng mã sinh nhật thành công!',
            'coupon' => $coupon->code
        ]);
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

    private function resolveCart(Request $request, $createIfNotFound = false)
    {
        $user = auth('sanctum')->user();

        if ($user) {
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
}
