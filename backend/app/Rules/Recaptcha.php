<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\Http;

class Recaptcha implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  \Closure(string): \Illuminate\Translation\PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        $secret = env('RECAPTCHA_SECRET_KEY');

        if (empty($secret)) {
            // Bypass validation if key is not configured (e.g., local dev without keys)
            return;
        }

        $response = Http::asForm()->post('https://www.google.com/recaptcha/api/siteverify', [
            'secret' => $secret,
            'response' => $value,
            'remoteip' => request()->ip()
        ]);

        $responseData = $response->json();

        if (!$responseData['success']) {
            $fail('Mã xác nhận CAPTCHA không hợp lệ hoặc đã hết hạn.');
        }
    }
}
