<?php

namespace App\Http\Requests\AdminFaceRecognition;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class VerifyFaceRequest extends FormRequest
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
            'threshold' => ['nullable', 'numeric', 'min:0.3', 'max:0.8'],
        ];
    }

    public function messages(): array
    {
        return [
            'descriptor.required' => 'Khong nhan duoc du lieu dinh danh khuon mat.',
            'descriptor.array' => 'Du lieu dinh danh khuon mat khong hop le.',
            'descriptor.size' => 'Du lieu dinh danh khuon mat phai co dung 128 gia tri.',
            'descriptor.*.numeric' => 'Du lieu dinh danh khuon mat chi duoc chua so.',
            'descriptor.*.between' => 'Du lieu dinh danh khuon mat nam ngoai nguong cho phep.',
            'threshold.min' => 'Nguong nhan dien khong duoc nho hon 0.3.',
            'threshold.max' => 'Nguong nhan dien khong duoc lon hon 0.8.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu doi chieu khuon mat khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
