<?php

namespace App\Http\Requests\Client\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $rules = [
            'email' => 'required|email',
        ];

        // Chỉ yêu cầu CAPTCHA nếu là yêu cầu gửi OTP mới (chưa có trong Cache)
        if (!\Illuminate\Support\Facades\Cache::store('file')->has('user_password_reset_otp_' . $this->input('email'))) {
            $rules['g-recaptcha-response'] = ['required', new \App\Rules\Recaptcha];
        }

        return $rules;
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
