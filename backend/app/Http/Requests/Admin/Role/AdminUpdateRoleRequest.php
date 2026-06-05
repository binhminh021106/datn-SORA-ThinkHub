<?php

namespace App\Http\Requests\Admin\Role;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $roleId = $this->route('role'); 

        return [
            'value'       => ['required', 'string', 'max:50', Rule::unique('roles', 'value')->ignore($roleId)],
            'label'       => ['required', 'string', 'max:70'],
            'badgeClass'  => ['nullable', 'string', 'max:50'],
            'level'       => ['required', 'integer', 'min:1'],
        ];
    }
}