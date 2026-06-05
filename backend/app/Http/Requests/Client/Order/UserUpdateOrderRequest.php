<?php

namespace App\Http\Requests\Client\Order;

use Illuminate\Foundation\Http\FormRequest;

class UserUpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

     public function rules(): array
    {
        return [
            'action'        => 'required|string|in:cancel',
            'cancel_reason' => 'required_if:action,cancel|string|min:10|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'action.required'           => 'Yêu cầu không hợp lệ.',
            'action.in'                 => 'Hành động không được hệ thống hỗ trợ.',
            'cancel_reason.required_if' => 'Vui lòng cho chúng tôi biết lý do bạn hủy đơn hàng.',
            'cancel_reason.min'         => 'Lý do hủy đơn cần chi tiết hơn (ít nhất 10 ký tự).',
        ];
    }
    
}