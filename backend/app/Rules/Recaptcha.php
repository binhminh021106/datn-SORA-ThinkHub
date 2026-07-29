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
        $secret = config('services.recaptcha.secret');

        if (empty($secret)) {
            // Local/test environments may deliberately omit third-party keys.
            // Every deployed environment must fail closed instead of accepting
            // automated contact submissions without a CAPTCHA verification.
            if (app()->environment(['local', 'testing'])) {
                return;
            }

            $fail('Hệ thống xác minh CAPTCHA chưa được cấu hình. Vui lòng thử lại sau.');
            return;
        }

        try {
            $response = Http::asForm()->timeout(5)->post('https://www.google.com/recaptcha/api/siteverify', [
                'secret' => $secret,
                'response' => $value,
                'remoteip' => request()->ip()
            ]);

            if (!$response->json('success', false)) {
                $fail('Mã xác nhận CAPTCHA không hợp lệ hoặc đã hết hạn.');
            }
        } catch (\Illuminate\Http\Client\ConnectionException $e) {
            report($e);
            $fail('Không thể xác minh CAPTCHA lúc này. Vui lòng thử lại.');
        }
    }
}
