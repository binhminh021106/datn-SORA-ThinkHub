<?php

namespace App\Http\Requests\Admin\Profile;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateAdminPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'new_password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }

    public function messages(): array
    {
        return [
            'new_password.required'  => 'Vui lòng nhập mật khẩu mới.',
            'new_password.min'       => 'Mật khẩu phải chứa ít nhất 8 ký tự.',
            'new_password.confirmed' => 'Mật khẩu xác nhận không trùng khớp.',
        ];
    }
}