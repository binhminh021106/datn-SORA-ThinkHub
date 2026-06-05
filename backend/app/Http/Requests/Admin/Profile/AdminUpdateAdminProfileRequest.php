<?php

namespace App\Http\Requests\Admin\Profile;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateAdminProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fullname' => ['required', 'string', 'max:100'],
            'phone'    => ['required', 'string', 'max:20'],
            'address'  => ['nullable', 'string', 'max:255'],
            'avatar'   => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:5120'], 
        ];
    }

    public function messages(): array
    {
        return [
            'fullname.required' => 'Họ và tên không được để trống.',
            'phone.required'    => 'Số điện thoại không được để trống.',
            'avatar.image'      => 'File tải lên phải là hình ảnh.',
            'avatar.mimes'      => 'Chỉ chấp nhận ảnh định dạng JPG, JPEG, PNG.',
            'avatar.max'        => 'Dung lượng ảnh tối đa là 5MB.',
        ];
    }
}