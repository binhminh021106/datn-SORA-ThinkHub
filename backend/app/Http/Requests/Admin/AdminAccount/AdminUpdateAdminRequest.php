<?php

namespace App\Http\Requests\Admin\AdminAccount;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateAdminRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $adminId = $this->route('staff');

        return [
            'fullname' => ['required', 'string', 'max:100'],
            'email'    => [
                'required',
                'email',
                'max:100',
                Rule::unique('admins', 'email')->ignore($adminId)->whereNull('deleted_at')
            ],
            'password' => ['nullable', 'string', 'min:8'],

            'role_id'  => ['required', 'integer', 'exists:roles,id'],
            'phone'    => ['nullable', 'string', 'max:20', 'regex:/^[0-9\-\+\s\(\)]+$/'],
            'status'   => ['required', 'string', Rule::in(['active', 'locked'])],
            'avatar'   => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'],
            'address'  => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'fullname.required' => 'Họ và tên không được để trống.',
            'fullname.max'      => 'Họ và tên không được vượt quá 100 ký tự.',
            'email.required'    => 'Email không được để trống.',
            'email.email'       => 'Định dạng email không hợp lệ.',
            'email.unique'      => 'Email này đã bị trùng với một tài khoản khác trên hệ thống.',
            'password.min'      => 'Mật khẩu mới phải có ít nhất 8 ký tự.',
            'role_id.required'  => 'Vui lòng chọn chức vụ/phân quyền.',
            'role_id.exists'    => 'Chức vụ không hợp lệ hoặc đã bị xóa.',
            'phone.regex'       => 'Số điện thoại chỉ được chứa chữ số và các ký tự (+, -, ngoặc).',
            'phone.max'         => 'Số điện thoại quá dài (tối đa 20 ký tự).',
            'status.required'   => 'Vui lòng chọn trạng thái.',
            'status.in'         => 'Trạng thái không hợp lệ.',
            'avatar.image'      => 'File tải lên phải là hình ảnh.',
            'avatar.mimes'      => 'Hình ảnh chỉ hỗ trợ định dạng: jpeg, png, jpg, webp.',
            'avatar.max'        => 'Dung lượng ảnh tối đa không được vượt quá 5MB.',
        ];
    }
}
