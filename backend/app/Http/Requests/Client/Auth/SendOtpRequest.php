<?php

namespace App\Http\Requests\Client\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => mb_strtolower(trim((string) $this->input('email', ''))),
        ]);
    }

    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'email' => 'required|string|max:255|email',
            'g-recaptcha-response' => ['required', new \App\Rules\Recaptcha],
        ];
    }

    public function messages()
    {
        return [
            'g-recaptcha-response.required' => 'Vui lòng xác minh bạn không phải là robot.',
            'email.required' => 'Vui lòng nhập địa chỉ email.',
            'email.email' => 'Địa chỉ email không hợp lệ.',
        ];
    }
}
