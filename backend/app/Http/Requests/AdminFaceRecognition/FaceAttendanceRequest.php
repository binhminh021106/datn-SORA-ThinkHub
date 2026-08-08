<?php

namespace App\Http\Requests\AdminFaceRecognition;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class FaceAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'descriptor' => ['required', 'array', 'size:128'],
            'descriptor.*' => ['required', 'numeric', 'between:-10,10'],
            'confirm_checkout' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'descriptor.required' => 'Khong nhan duoc du lieu khuon mat de cham cong.',
            'descriptor.array' => 'Du lieu khuon mat cham cong khong hop le.',
            'descriptor.size' => 'Du lieu khuon mat cham cong phai co dung 128 gia tri.',
            'descriptor.*.numeric' => 'Du lieu khuon mat cham cong chi duoc chua so.',
            'descriptor.*.between' => 'Du lieu khuon mat cham cong nam ngoai nguong cho phep.',
            'confirm_checkout.boolean' => 'Trang thai xac nhan tan ca khong hop le.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu cham cong khuon mat khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
