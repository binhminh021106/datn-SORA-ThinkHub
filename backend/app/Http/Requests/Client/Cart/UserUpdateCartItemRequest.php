<?php

namespace App\Http\Requests\Client\Cart;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\CartItem;
use App\Models\ProductVariant;

class UserUpdateCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'quantity' => [
                'required',
                'integer',
                'min:1'
            ],
        ];
    }

    /**
     * Sparring Partner: Rào khép kín mọi lỗ hổng khi khách tăng/giảm số lượng
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            
            // FIX BLIND SPOT: Bắt trọn tên tham số định nghĩa trong routes/api.php
            // Đảm bảo không bao giờ bị null dù tên Route là gì
            $idParam = $this->route('cartItem') ?? $this->route('cart_item') ?? $this->route('id') ?? $this->route('cart');
            
            $cartItem = CartItem::find($idParam);

            if (!$cartItem) {
                $validator->errors()->add('quantity', 'Không tìm thấy thông tin sản phẩm trong giỏ hàng.');
                return;
            }

            $requestedQuantity = (int) $this->quantity;

            // Rào lỗi 1: Tăng số lượng SẢN PHẨM LẺ
            if ($cartItem->product_variant_id) {
                $variant = $cartItem->variant;
                // Nhỡ Admin vừa xóa sản phẩm khi khách đang xem giỏ hàng?
                if (!$variant) {
                    $validator->errors()->add('quantity', 'Sản phẩm này đã ngừng kinh doanh.');
                    return;
                }

                if ($requestedQuantity > $variant->stock_quantity) {
                    $validator->errors()->add('quantity', "Kho không đủ, tối đa bạn có thể mua là {$variant->stock_quantity} chiếc.");
                }
            }

            // Rào lỗi 2: Tăng số lượng COMBO
            if ($cartItem->combo_id && is_array($cartItem->combo_selections)) {
                $variantIds = array_column($cartItem->combo_selections, 'selected_variant_id');
                $variantsInCombo = ProductVariant::whereIn('id', $variantIds)->get();

                // Build lookup array để tối ưu vòng lặp
                $variantStockMap = $variantsInCombo->pluck('stock_quantity', 'id')->toArray();

                foreach ($cartItem->combo_selections as $selection) {
                    $vId = $selection['selected_variant_id'] ?? null;
                    if (!$vId || !isset($variantStockMap[$vId])) {
                        $validator->errors()->add('quantity', 'Một phân loại trong Combo đã ngừng kinh doanh.');
                        break;
                    }

                    // Tăng số lượng Combo = Tăng số lượng từng món bên trong
                    if ($requestedQuantity > $variantStockMap[$vId]) {
                        $validator->errors()->add('quantity', "Kho không đủ, một trong các món thuộc combo chỉ còn {$variantStockMap[$vId]} chiếc.");
                        break;
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'quantity.required' => 'Số lượng không được để trống.',
            'quantity.integer'  => 'Số lượng phải là định dạng số.',
            'quantity.min'      => 'Số lượng không được nhỏ hơn 1.',
        ];
    }
}