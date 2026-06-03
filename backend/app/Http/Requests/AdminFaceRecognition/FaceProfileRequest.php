<?php

namespace App\Http\Requests\AdminFaceRecognition;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class FaceProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admin_id' => [
                'nullable',
                'integer',
                Rule::exists('admins', 'id')->whereNull('deleted_at'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_id.integer' => 'Nhan su khong hop le.',
            'admin_id.exists' => 'Khong tim thay nhan su duoc chon.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu ho so khuon mat khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
