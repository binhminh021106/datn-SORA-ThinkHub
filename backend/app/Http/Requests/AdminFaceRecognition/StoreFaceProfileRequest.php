<?php

namespace App\Http\Requests\AdminFaceRecognition;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

class StoreFaceProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admin_id' => [
                'required',
                'integer',
                Rule::exists('admins', 'id')->whereNull('deleted_at'),
            ],
            'descriptors' => ['required', 'array', 'min:1', 'max:5'],
            'descriptors.*' => ['required', 'array', 'size:128'],
            'descriptors.*.*' => ['required', 'numeric', 'between:-10,10'],
            'model_name' => ['nullable', 'string', 'max:100'],
            'model_version' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_id.required' => 'Vui long chon nhan su de ghi mau khuon mat.',
            'admin_id.exists' => 'Khong tim thay nhan su duoc chon.',
            'descriptors.required' => 'Khong nhan duoc du lieu dinh danh khuon mat.',
            'descriptors.array' => 'Du lieu dinh danh khuon mat khong hop le.',
            'descriptors.min' => 'Can it nhat 1 mau khuon mat.',
            'descriptors.max' => 'Chi ho tro toi da 5 mau khuon mat.',
            'descriptors.*.size' => 'Moi mau khuon mat phai co dung 128 gia tri.',
            'descriptors.*.*.numeric' => 'Du lieu dinh danh khuon mat chi duoc chua so.',
            'descriptors.*.*.between' => 'Du lieu dinh danh khuon mat nam ngoai nguong cho phep.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu ghi mau khuon mat khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
