<?php

namespace App\Http\Requests\Admin\Inventory;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateComboLimitRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules()
    {
        return [
            'usage_limit' => 'required|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'usage_limit.required' => 'Vui lòng nhập giới hạn số lượng Combo.',
            'usage_limit.integer'  => 'Giới hạn Combo phải là một số nguyên.',
            'usage_limit.min'      => 'Giới hạn Combo không được là số âm.',
        ];
    }
}