<?php

namespace App\Http\Requests\Client\Cart;

use Illuminate\Foundation\Http\FormRequest;

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
                'min:1',
                'max:100'
            ],
        ];
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
