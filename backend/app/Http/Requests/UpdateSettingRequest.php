<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'present|nullable',
            'settings.*.type' => 'nullable|string|in:string,json,image',
        ];
    }

    /**
     * Configure the validator instance.
     *
     * @param  \Illuminate\Validation\Validator  $validator
     * @return void
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $settings = $this->input('settings', []);
            foreach ($settings as $index => $setting) {
                if (isset($setting['key']) && $setting['key'] === 'footer_socials') {
                    $value = $setting['value'] ?? [];
                    if (is_array($value)) {
                        foreach ($value as $socialIndex => $social) {
                            $url = $social['url'] ?? '';
                            if (!empty($url)) {
                                $isValid = false;
                                if (is_string($url)) {
                                    if (trim($url) === '#') {
                                        $isValid = true;
                                    } else {
                                        $scheme = parse_url($url, PHP_URL_SCHEME);
                                        $host = parse_url($url, PHP_URL_HOST);
                                        if (filter_var($url, FILTER_VALIDATE_URL) !== false && !empty($host) && in_array(strtolower((string)$scheme), ['http', 'https'])) {
                                            $isValid = true;
                                        }
                                    }
                                }
                                if (!$isValid) {
                                    $validator->errors()->add(
                                        "settings.{$index}.value.{$socialIndex}.url",
                                        'Đường link Mạng xã hội phải là link hợp lệ (bắt đầu bằng http/https) hoặc dùng dấu "#" nếu chưa có.'
                                    );
                                }
                            }
                        }
                    }
                }
            }
        });
    }
}
