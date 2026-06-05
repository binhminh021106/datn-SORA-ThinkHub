<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateVariantStockRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            'action'   => 'required|in:add,subtract',
            'quantity' => 'required|integer|min:1',  
            'note'     => 'nullable|string|max:500', 
        ];
    }

    public function messages(): array
    {
        return [
            'action.required'   => 'Vui lòng chọn loại thao tác (Nhập thêm hoặc Trừ bớt).',
            'action.in'         => 'Loại thao tác không hợp lệ.',
            'quantity.required' => 'Vui lòng nhập số lượng thay đổi.',
            'quantity.integer'  => 'Số lượng phải là một số nguyên.',
            'quantity.min'      => 'Số lượng thay đổi phải lớn hơn 0.',
            'note.max'          => 'Ghi chú không được vượt quá 500 ký tự.',
        ];
    }
}