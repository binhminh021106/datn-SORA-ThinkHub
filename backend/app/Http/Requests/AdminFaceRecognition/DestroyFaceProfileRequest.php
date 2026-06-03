<?php

namespace App\Http\Requests\AdminFaceRecognition;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class DestroyFaceProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'admin_id' => $this->route('adminId'),
        ]);
    }

    public function rules(): array
    {
        return [
            'admin_id' => [
                'required',
                'integer',
                Rule::exists('admins', 'id')->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_id.required' => 'Vui long chon nhan su can xoa ho so khuon mat.',
            'admin_id.exists' => 'Khong tim thay nhan su can xoa ho so khuon mat.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu xoa ho so khuon mat khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
