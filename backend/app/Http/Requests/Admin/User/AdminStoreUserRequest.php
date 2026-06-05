<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminStoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullName' => ['required', 'string', 'max:150'],
            
            'email'    => ['required', 'email', 'max:150', Rule::unique('users', 'email')->whereNull('deleted_at')],
            
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            
            'phone'    => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->whereNull('deleted_at')],
            
            'status'   => ['required', Rule::in(['active', 'locked'])],
            
            'gender'   => ['nullable', 'string', 'max:10'],
            'birthday' => ['nullable', 'date'],
            'avatar'   => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:5120']
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required' => 'Họ và tên là bắt buộc.',
            'email.required'    => 'Email là bắt buộc.',
            'email.unique'      => 'Email này đã được sử dụng.',
            'password.required' => 'Mật khẩu là bắt buộc.',
            'password.min'      => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'password.confirmed'=> 'Mật khẩu xác nhận không khớp.',
            'phone.unique'      => 'Số điện thoại này đã được sử dụng.',
            'status.in'         => 'Trạng thái không hợp lệ.',
            'avatar.image'      => 'File tải lên phải là hình ảnh.',
            'avatar.max'        => 'Dung lượng ảnh tối đa là 5MB.',
        ];
    }
}