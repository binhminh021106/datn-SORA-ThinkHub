<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $userId = $this->route('id') ?? $this->route('user');
        if (is_object($userId)) {
            $userId = $userId->id;
        }
        if (!$userId && $this->user()) {
            $userId = $this->user()->id;
        }

        return [
            'fullName' => ['required', 'string', 'max:150'],
            
            'email'    => ['sometimes', 'email', 'max:150', Rule::unique('users', 'email')->ignore($userId)->whereNull('deleted_at')],
            'phone'    => ['nullable', 'string', 'max:20', Rule::unique('users', 'phone')->ignore($userId)->whereNull('deleted_at')],
            
            'status'   => ['required', Rule::in(['active', 'locked'])],
            'gender'   => ['nullable', 'string', 'max:10'],
            'birthday' => ['nullable', 'date'],
            
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
            
            'avatar'   => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:5120']
        ];
    }

    public function messages(): array
    {
        return [
            'fullName.required' => 'Họ và tên là bắt buộc.',
            'email.unique'      => 'Email này đã có người khác sử dụng.',
            'phone.unique'      => 'Số điện thoại này đã có người khác sử dụng.',
            'password.min'      => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'password.confirmed'=> 'Mật khẩu xác nhận không khớp.',
            'status.in'         => 'Trạng thái không hợp lệ.',
            'avatar.image'      => 'File tải lên phải là hình ảnh.',
            'avatar.max'        => 'Dung lượng ảnh tối đa là 5MB.',
        ];
    }
}