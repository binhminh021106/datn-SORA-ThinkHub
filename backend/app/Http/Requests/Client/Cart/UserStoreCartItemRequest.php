<?php

namespace App\Http\Requests\Client\Cart;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\ProductVariant;
use App\Models\Combo;

class UserStoreCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            // Bắt buộc phải có 1 trong 2: hoặc là sản phẩm lẻ, hoặc là combo
            'product_variant_id' => [
                'required',
                'integer',
                'exists:product_variants,id,deleted_at,NULL' 
            ],
            'combo_id' => [
                'prohibited',
                'required_without:product_variant_id',
                'nullable',
                'exists:combos,id,deleted_at,NULL'
            ],
            'combo_selections' => [
                'prohibited',
                'nullable',
                'array'
            ],
            'quantity' => [
                'required',
                'integer',
                'min:1',
                'max:100'
            ],
        ];
    }

    /**
     * Sparring Partner: Rào trước đón sau lỗi tồn kho ngay khi Thêm Mới
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $requestedQuantity = (int) $this->quantity;

            // 1. Kiểm tra tồn kho cho SẢN PHẨM LẺ
            if ($this->filled('product_variant_id')) {
                $variant = ProductVariant::find($this->product_variant_id);
                if ($variant && $requestedQuantity > $variant->stock_quantity) {
                    $validator->errors()->add('quantity', "Sản phẩm này chỉ còn {$variant->stock_quantity} chiếc trong kho.");
                }
            }

            // 2. Kiểm tra tồn kho cho COMBO (Check từng món bên trong)
            if ($this->filled('combo_id') && is_array($this->combo_selections)) {
                $variantIds = array_column($this->combo_selections, 'selected_variant_id');
                $variantsInCombo = ProductVariant::whereIn('id', $variantIds)->get();

                foreach ($variantsInCombo as $v) {
                    if ($requestedQuantity > $v->stock_quantity) {
                        $validator->errors()->add('quantity', "Một sản phẩm thuộc combo chỉ còn tối đa {$v->stock_quantity} chiếc. Vui lòng giảm số lượng.");
                        break; // Dừng check ngay khi phát hiện 1 món hết hàng
                    }
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'product_variant_id.required_without' => 'Vui lòng chọn sản phẩm hoặc combo.',
            'combo_id.required_without'           => 'Vui lòng chọn sản phẩm hoặc combo.',
            'product_variant_id.exists'           => 'Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.',
            'combo_id.exists'                     => 'Combo không tồn tại hoặc đã ngừng kinh doanh.',
            'quantity.required'                   => 'Vui lòng nhập số lượng.',
            'quantity.integer'                    => 'Số lượng phải là một số nguyên.',
            'quantity.min'                        => 'Số lượng tối thiểu là 1.',
        ];
    }
}
