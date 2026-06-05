<?php

namespace App\Http\Requests\Admin\Role;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'value'       => ['required', 'string', 'max:50', 'unique:roles,value'],
            'label'       => ['required', 'string', 'max:70'],
            'badgeClass'  => ['nullable', 'string', 'max:50'],
            'level'       => ['required', 'integer', 'min:1'], 
        ];
    }

    public function messages(): array
    {
        return [
            'value.required' => 'Mã Role không được để trống.',
            'value.unique'   => 'Mã Role đã tồn tại.',
            'label.required' => 'Tên hiển thị không được để trống.',
            'level.required' => 'Vui lòng chỉ định cấp độ (Level) cho Role.',
            'level.min'      => 'Cấp độ nhỏ nhất là 1 (Quyền tối cao).',
        ];
    }
}