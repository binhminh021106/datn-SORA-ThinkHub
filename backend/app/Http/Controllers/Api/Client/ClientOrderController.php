<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Http\Requests\Client\Order\UserStoreOrderRequest;
use App\Http\Requests\Client\Order\UserUpdateOrderRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Cart;
use App\Models\ProductVariant;
use App\Models\Coupon;
use App\Models\Review; // BẮT BUỘC: Đảm bảo bạn đã thêm dòng này
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;   // ← Thêm dòng này

class ClientOrderController extends Controller
{
    /**
     * Lấy danh sách đơn hàng của User hiện tại.
     */
    public function index(Request $request)
    {
        $user = auth('sanctum')->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng đăng nhập để xem lịch sử đơn hàng',
                'data' => []
            ], 401);
        }

        $validated = $request->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = $validated['per_page'] ?? 5;

        // Đã thêm 'reviews' vào để load kèm trạng thái đánh giá
        $orders = Order::with(['items', 'reviews'])
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($orders);
    }

    public function store(UserStoreOrderRequest $request)
    {
        $user = auth('sanctum')->user();
        $sessionId = $request->header('X-Cart-Session-Id');

        $cartQuery = Cart::with(['items.variant', 'items.combo']);
        $cart = $user ? $cartQuery->where('user_id', $user->id)->first() 
                      : $cartQuery->where('session_id', $sessionId)->first();

        if (!$cart || $cart->items->isEmpty()) {
            return response()->json(['success' => false, 'message' => 'Giỏ hàng của bạn đang trống'], 400);
        }

        try {
            return DB::transaction(function () use ($request, $user, $cart) {
                
                // 1. GOM TOÀN BỘ ID CỦA VARIANT (Bao gồm Sản phẩm lẻ & Món trong Combo) để Lock 1 lần
                $variantIdsToLock = [];
                foreach ($cart->items as $item) {
                    if ($item->product_variant_id) {
                        $variantIdsToLock[] = $item->product_variant_id;
                    } elseif ($item->combo_id && is_array($item->combo_selections)) {
                        $variantIdsToLock = array_merge($variantIdsToLock, array_column($item->combo_selections, 'selected_variant_id'));
                    }
                }
                
                $variants = ProductVariant::whereIn('id', array_unique($variantIdsToLock))
                            ->orderBy('id')
                            ->lockForUpdate() // Khóa dòng chống Race Condition
                            ->get()
                            ->keyBy('id');

                $subTotal = 0;
                $orderItemsData = [];

                // 2. KIỂM TRA TỒN KHO & CHUẨN BỊ DATA
                foreach ($cart->items as $item) {
                    // Xử lý Sản phẩm lẻ
                    if ($item->product_variant_id) {
                        $variant = $variants->get($item->product_variant_id);
                        if (!$variant || $variant->stock_quantity < $item->quantity) {
                            throw new \Exception("Sản phẩm SKU {$variant->sku} không đủ số lượng trong kho.");
                        }
                        
                        $variant->stock_quantity -= $item->quantity; // Trừ kho ảo trong biến nhớ
                        $variant->save();

                        $itemTotal = $item->subtotal; // Lấy luôn giá trị tạm tính từ CartItem Model
                        $subTotal += $itemTotal;

                        $orderItemsData[] = [
                            'product_id'         => $variant->product_id,
                            'product_variant_id' => $variant->id,
                            'product_name'       => $variant->product->name ?? 'Sản phẩm SORA',
                            'variant_sku'        => $variant->sku,
                            'variant_attributes' => $variant->attributes, // Tự encode vì model cast array
                            'variant_image'      => $variant->image_url,
                            'price'              => $item->price,
                            'quantity'           => $item->quantity,
                            'total_price'        => $itemTotal,
                            'combo_id'           => null,
                            'combo_selections'   => null,
                        ];
                    } 
                    // Xử lý Combo
                    elseif ($item->combo_id && $item->combo) {
                        if (is_array($item->combo_selections)) {
                            foreach ($item->combo_selections as $selection) {
                                $vId = $selection['selected_variant_id'];
                                $variant = $variants->get($vId);
                                
                                if (!$variant || $variant->stock_quantity < $item->quantity) {
                                    throw new \Exception("Một sản phẩm trong bộ {$item->combo->name} đã hết hàng.");
                                }
                                $variant->stock_quantity -= $item->quantity;
                                $variant->save();
                            }
                        }

                        $itemTotal = $item->subtotal;
                        $subTotal += $itemTotal;

                        $orderItemsData[] = [
                            'product_id'         => null,
                            'product_variant_id' => null,
                            'product_name'       => $item->combo->name,
                            'variant_sku'        => 'COMBO-' . $item->combo_id,
                            'variant_attributes' => null,
                            'variant_image'      => $item->combo->thumbnail_image,
                            'price'              => $item->price,
                            'quantity'           => $item->quantity,
                            'total_price'        => $itemTotal,
                            'combo_id'           => $item->combo_id,
                            'combo_selections'   => $item->combo_selections,
                        ];
                    }
                }

                // 3. XỬ LÝ COUPON (Bắt chặt điều kiện)
                $discountAmount = 0;
                $couponId = null;
                if ($request->coupon_code) {
                    $coupon = Coupon::where('code', $request->coupon_code)->lockForUpdate()->first();
                    
                    if (!$coupon || $coupon->status !== 'active') {
                        throw new \Exception("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
                    }
                    if ($coupon->usage_limit !== null && $coupon->usage_count >= $coupon->usage_limit) {
                        throw new \Exception("Mã giảm giá đã hết lượt sử dụng.");
                    }
                    if ($subTotal < $coupon->min_spend) {
                        throw new \Exception("Chưa đạt giá trị đơn hàng tối thiểu để dùng mã này.");
                    }

                    $discountAmount = ($coupon->type === 'fixed') ? $coupon->value : ($subTotal * ($coupon->value / 100));
                    $couponId = $coupon->id;
                    $coupon->increment('usage_count');
                }

                $shippingFee = $subTotal > 500000 ? 0 : 30000;
                $totalAmount = max($subTotal - $discountAmount + $shippingFee, 0);

                // 4. TẠO ĐƠN HÀNG
                $order = Order::create([
                    'order_code'       => 'ORD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
                    'user_id'          => $user->id ?? null,
                    'customer_name'    => $request->customer_name,
                    'customer_phone'   => $request->customer_phone,
                    'customer_email'   => $request->customer_email, // Đã thêm Email
                    'customer_address' => $request->customer_address,
                    'order_note'       => $request->order_note,
                    'sub_total'        => $subTotal,
                    'discount_amount'  => $discountAmount,
                    'shipping_fee'     => $shippingFee,
                    'total_amount'     => $totalAmount,
                    'coupon_id'        => $couponId,
                    'coupon_code'      => $request->coupon_code,
                    'payment_method'   => $request->payment_method,
                    'payment_status'   => 'unpaid',
                    'status'           => 'pending',
                ]);

                // 5. LƯU CHI TIẾT
                foreach ($orderItemsData as $itemData) {
                    $itemData['order_id'] = $order->id;
                    OrderItem::create($itemData);
                }

                // 6. GHI LỊCH SỬ (Chuẩn hóa changed_by_type)
                OrderStatusHistory::create([
                    'order_id'        => $order->id,
                    'new_status'      => 'pending',
                    'note'            => 'Khách hàng đặt đơn thành công',
                    'changed_by'      => $user->id ?? null,
                    'changed_by_type' => $user ? 'user' : 'guest', // Phân loại ai là người tạo
                ]);

                // 7. XÓA GIỎ HÀNG
                $cart->items()->delete();
                $cart->delete();

                return response()->json([
                    'success' => true,
                    'message' => 'Đặt hàng thành công!',
                    'data' => [
                        'order_code'   => $order->order_code,
                        'total_amount' => $order->total_amount
                    ]
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 400);
        }
    }

    /**
     * Xem chi tiết đơn hàng (Dành cho User đã login)
     */
    public function show(string $order_code)
    {
        $user = auth('sanctum')->user();
        
        // Đã thêm 'reviews' vào để load kèm trạng thái đánh giá
        $order = Order::with(['items', 'histories', 'reviews'])->where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        // Bảo mật: Nếu có User_id, phải check xem đúng chính chủ không
        if ($order->user_id && (!$user || $user->id !== $order->user_id)) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xem đơn hàng này'], 403);
        }

        return response()->json(['success' => true, 'data' => $order]);
    }

    /**
     * Khách hàng chủ động HỦY đơn hàng.
     */
    public function update(UserUpdateOrderRequest $request, string $order_code)
    {
        $user = auth('sanctum')->user();
        $order = Order::with('items')->where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        if ($order->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Chỉ có thể hủy đơn khi đang ở trạng thái Chờ xác nhận'], 400);
        }

        if ($order->user_id && (!$user || $user->id !== $order->user_id)) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền hủy đơn hàng này'], 403);
        }

        try {
            return DB::transaction(function () use ($order, $request, $user) {
                $order->update(['status' => 'cancelled']);

                // FIX LỖI TỬ HUYỆT: Hoàn lại tồn kho cho cả Sản phẩm lẻ VÀ Combo
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::where('id', $item->product_variant_id)->increment('stock_quantity', $item->quantity);
                    } elseif ($item->combo_id && is_array($item->combo_selections)) {
                        foreach ($item->combo_selections as $selection) {
                            $vId = $selection['selected_variant_id'] ?? null;
                            if ($vId) {
                                ProductVariant::where('id', $vId)->increment('stock_quantity', $item->quantity);
                            }
                        }
                    }
                }

                // Ghi lịch sử rõ ràng
                OrderStatusHistory::create([
                    'order_id'        => $order->id,
                    'old_status'      => 'pending',
                    'new_status'      => 'cancelled',
                    'note'            => 'Khách hủy: ' . $request->cancel_reason,
                    'changed_by'      => $user->id ?? null,
                    'changed_by_type' => $user ? 'user' : 'guest',
                ]);

                return response()->json(['success' => true, 'message' => 'Đã hủy đơn hàng thành công']);
            });
        } catch (\Exception $e) {
             return response()->json(['success' => false, 'message' => 'Không thể hủy đơn: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(string $id) 
    {
        return response()->json(['success' => false, 'message' => 'Xóa đơn hàng vĩnh viễn không được phép'], 403);
    }
    
    /**
     * Khách hàng đánh giá đơn hàng (Từng sản phẩm)
     */
    public function review(Request $request, string $order_code)
    {
        // Bao bọc toàn bộ code bằng try-catch để bắt mọi lỗi PHP/SQL
        try {
            $user = auth('sanctum')->user();
            $order = Order::where('order_code', $order_code)->first();

            if (!$order) {
                return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
            }

            if ($order->status !== 'delivered') {
                return response()->json(['success' => false, 'message' => 'Bạn chỉ có thể đánh giá khi đơn hàng đã giao thành công'], 400);
            }

            if ($order->user_id && (!$user || $user->id !== $order->user_id)) {
                return response()->json(['success' => false, 'message' => 'Bạn không có quyền đánh giá đơn hàng này'], 403);
            }

            // Kiểm tra xem đơn hàng đã đánh giá chưa
            $existingReview = Review::where('order_id', $order->id)->first();
            if ($existingReview) {
                return response()->json(['success' => false, 'message' => 'Đơn hàng này đã được đánh giá.'], 400);
            }

            // Validate dữ liệu từ FormData
            $request->validate([
                'reviews' => 'required|array',
                'reviews.*.product_id' => 'nullable|integer|exists:products,id',
                'reviews.*.combo_id'   => 'nullable|integer|exists:combos,id',
                'reviews.*.rating'     => 'required|integer|min:1|max:5',
                'reviews.*.comment'    => 'nullable|string|max:1000',
                'reviews.*.images.*'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            ]);

            DB::beginTransaction();

            foreach ($request->reviews as $itemData) {
                $imagePaths = [];
                if (isset($itemData['images']) && is_array($itemData['images'])) {
                    foreach ($itemData['images'] as $image) {
                        $path = $image->store('reviews', 'public');
                        $imagePaths[] = $path;
                    }
                }

                Review::create([
                    'order_id'   => $order->id,
                    'user_id'    => $user->id ?? null,
                    'product_id' => $itemData['product_id'] ?? null,
                    'combo_id'   => $itemData['combo_id'] ?? null,
                    'rating'     => $itemData['rating'],
                    'comment'    => $itemData['comment'] ?? null,
                    'images'     => empty($imagePaths) ? null : $imagePaths,
                    'status'     => 'approved', // Sửa từ 'published' thành 'approved' khớp với DB ENUM
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true, 
                'message' => 'Cảm ơn bạn đã đánh giá sản phẩm!'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Dữ liệu không hợp lệ, hãy kiểm tra lại hình ảnh.', 
                'errors' => $e->errors()
            ], 422);
            
        } catch (\Throwable $e) { // Dùng Throwable sẽ tóm được cả lỗi thiếu file (Class Not Found) hoặc lỗi Database Constraints
            if (DB::transactionLevel() > 0) {
                DB::rollBack();
            }
            return response()->json([
                'success' => false, 
                'message' => 'Lỗi Backend: ' . $e->getMessage() . ' (Dòng ' . $e->getLine() . ')'
            ], 500);
        }
    }

    /**
     * Lấy đánh giá của một đơn hàng
     */
    public function getReview(string $order_code)
    {
        $user = auth('sanctum')->user();
        $order = Order::where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        if ($order->user_id && (!$user || $user->id !== $order->user_id)) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền xem đánh giá này'], 403);
        }

        $reviews = Review::where('order_id', $order->id)->get();

        return response()->json([
            'success' => true,
            'data' => $reviews,
            'count' => $reviews->count()
        ]);
    }

    /**
     * Chức năng Mua lại (Thêm toàn bộ sản phẩm của đơn hàng cũ vào giỏ)
     */
    public function reorder(Request $request, string $order_code)
    {
        $user = auth('sanctum')->user();
        
        // Lấy đơn hàng cùng chi tiết sản phẩm
        $order = Order::with('items')->where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        $sessionId = $request->header('X-Cart-Session-Id');

        // 1. Tìm hoặc tạo Giỏ hàng (Cart) gốc cho User hoặc Session
        $cart = Cart::where(function($query) use ($user, $sessionId) {
            if ($user) $query->where('user_id', $user->id);
            else $query->where('session_id', $sessionId);
        })->first();

        if (!$cart) {
            $cart = new Cart();
            if ($user) $cart->user_id = $user->id;
            else $cart->session_id = $sessionId;
            $cart->save();
        }

        // 2. LƯU CHUẨN XÁC VÀO BẢNG CHI TIẾT GIỎ HÀNG (CartItem)
        foreach ($order->items as $item) {
            
            // Trường hợp 1: Sản phẩm lẻ
            if ($item->product_variant_id) {
                $cartItem = \App\Models\CartItem::where('cart_id', $cart->id)
                    ->where('product_variant_id', $item->product_variant_id)
                    ->whereNull('combo_id')
                    ->first();

                if ($cartItem) {
                    $cartItem->increment('quantity', $item->quantity);
                } else {
                    $newCartItem = new \App\Models\CartItem();
                    $newCartItem->cart_id = $cart->id;
                    $newCartItem->product_variant_id = $item->product_variant_id;
                    $newCartItem->quantity = $item->quantity;
                    $newCartItem->save();
                }
            } 
            // Trường hợp 2: Sản phẩm là Combo
            elseif ($item->combo_id) {
                $newCartItem = new \App\Models\CartItem();
                $newCartItem->cart_id = $cart->id;
                $newCartItem->combo_id = $item->combo_id;
                $newCartItem->combo_selections = $item->combo_selections; 
                $newCartItem->quantity = $item->quantity;
                $newCartItem->save();
            }
        }

        return response()->json([
            'success' => true, 
            'message' => 'Các sản phẩm đã được thêm lại vào giỏ hàng thành công.'
        ]);
    }
        /**
     * Xuất hóa đơn PDF (khách hàng tự xuất)
     */
    public function invoice(string $order_code)
    {
        $user = auth('sanctum')->user();
        
        $order = Order::with(['items'])
                    ->where('order_code', $order_code)
                    ->firstOrFail();

        // Bảo mật: chỉ chủ đơn hàng mới được xuất
        if ($order->user_id && (!$user || $order->user_id !== $user->id)) {
            abort(403, 'Bạn không có quyền xuất hóa đơn này.');
        }

        $pdf = Pdf::loadView('invoices.order', compact('order'));
        $pdf->setPaper('A4');

        // Cấu hình để hỗ trợ CSS và hình ảnh tốt hơn
        $pdf->setOptions([
            'isHtml5ParserEnabled' => true,
            'isRemoteEnabled'      => true,
            'defaultFont'          => 'DejaVu Sans',
        ]);

        return $pdf->download("hoa-don-{$order->order_code}.pdf");
    }
        /**
     * Khách hàng yêu cầu hoàn hàng / hoàn tiền
     */
    public function requestReturn(Request $request, string $order_code)
    {
        $user = auth('sanctum')->user();
        $order = Order::with('items')->where('order_code', $order_code)->first();

        if (!$order) {
            return response()->json(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
        }

        if ($order->status !== 'delivered') {
            return response()->json(['success' => false, 'message' => 'Chỉ có thể yêu cầu hoàn hàng khi đơn đã giao thành công'], 400);
        }

        if ($order->user_id && (!$user || $user->id !== $order->user_id)) {
            return response()->json(['success' => false, 'message' => 'Bạn không có quyền thực hiện'], 403);
        }

        $request->validate([
            'return_reason' => 'required|string|min:10|max:500',
            'images.*'      => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        try {
            return DB::transaction(function () use ($order, $request, $user) {
                // Cập nhật trạng thái đơn hàng
                $order->update(['status' => 'return_requested']);

                // Hoàn lại tồn kho (giống hủy đơn)
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        ProductVariant::where('id', $item->product_variant_id)
                            ->increment('stock_quantity', $item->quantity);
                    } elseif ($item->combo_id && is_array($item->combo_selections)) {
                        foreach ($item->combo_selections as $selection) {
                            $vId = $selection['selected_variant_id'] ?? null;
                            if ($vId) {
                                ProductVariant::where('id', $vId)
                                    ->increment('stock_quantity', $item->quantity);
                            }
                        }
                    }
                }

                // Lưu lịch sử
                OrderStatusHistory::create([
                    'order_id'        => $order->id,
                    'old_status'      => 'delivered',
                    'new_status'      => 'return_requested',
                    'note'            => 'Khách yêu cầu hoàn hàng: ' . $request->return_reason,
                    'changed_by'      => $user->id ?? null,
                    'changed_by_type' => $user ? 'user' : 'guest',
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Yêu cầu hoàn hàng đã được gửi. Chúng tôi sẽ kiểm tra và phản hồi sớm nhất!'
                ]);
            });
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}