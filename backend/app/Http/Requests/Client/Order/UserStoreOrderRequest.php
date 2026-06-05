<?php

namespace App\Http\Requests\Client\Order;

use Illuminate\Foundation\Http\FormRequest;

class UserStoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|regex:/^([0-9\s\-\+\(\)]*)$/|min:9|max:15',
            'customer_email'   => 'required|email|max:255', 
            'customer_address' => 'required|string|max:1000',
            'order_note'       => 'nullable|string|max:1000',
            'coupon_code'      => 'nullable|string|exists:coupons,code',
            'payment_method'   => 'required|in:cod,vnpay,momo,bank_transfer',
        ];
    }

    public function messages(): array
    {
        return [
            'customer_name.required'    => 'Vui lòng nhập họ tên người nhận.',
            'customer_phone.required'   => 'Vui lòng nhập số điện thoại.',
            'customer_phone.regex'      => 'Số điện thoại không hợp lệ.',
            'customer_email.required'   => 'Vui lòng nhập địa chỉ email.',
            'customer_email.email'      => 'Email không đúng định dạng.',
            'customer_address.required' => 'Vui lòng nhập địa chỉ giao hàng.',
            'payment_method.required'   => 'Vui lòng chọn phương thức thanh toán.',
            'payment_method.in'         => 'Phương thức thanh toán không được hỗ trợ.',
        ];
    }
}