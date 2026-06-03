<?php

namespace App\Http\Requests\AdminAttendance;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class QrAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'qr_token' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'qr_token.string' => 'Ma QR khong hop le.',
            'qr_token.max' => 'Ma QR vuot qua do dai cho phep.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu diem danh QR khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
