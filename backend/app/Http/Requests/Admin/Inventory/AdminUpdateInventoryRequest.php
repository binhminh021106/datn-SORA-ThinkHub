<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateInventoryRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'action'      => 'nullable|in:add', 
            'quantity'    => 'nullable|integer|min:1|required_with:action',
            
            'note'        => 'required_with:action|string|max:500',

            'usage_limit' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'action.in'             => 'Hệ thống chỉ cho phép thao tác Nhập thêm (add) vào kho.',
            'quantity.required_with'=> 'Vui lòng nhập số lượng cần thêm.',
            'quantity.integer'      => 'Số lượng phải là một số nguyên.',
            'quantity.min'          => 'Số lượng nhập thêm phải lớn hơn 0.',
            
            'note.required_with'    => 'Bắt buộc phải nhập Lý do / Mã phiếu nhập kho để đảm bảo minh bạch.',
            'note.max'              => 'Ghi chú không được vượt quá 500 ký tự.',
            
            'usage_limit.integer'   => 'Giới hạn Combo phải là một số nguyên.',
            'usage_limit.min'       => 'Giới hạn Combo không được là số âm.',
        ];
    }
}