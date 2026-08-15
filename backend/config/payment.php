<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Payment callback and client return URLs
    |--------------------------------------------------------------------------
    |
    | These values deliberately live in config so they remain available after
    | `php artisan config:cache`. Production must set PAYMENT_CALLBACK_BASE_URL
    | to the exact public HTTPS origin that the payment providers can reach.
    |
    */
    'callback_base_url' => env('PAYMENT_CALLBACK_BASE_URL'),
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),
    'attempt_ttl_minutes' => (int) env('PAYMENT_ATTEMPT_TTL_MINUTES', 15),
    'mobile_allowed_schemes' => array_values(array_filter(array_map(
        'trim',
        explode(',', env('MOBILE_APP_ALLOWED_SCHEMES', 'sora,exp,exps'))
    ))),

    'auto_cancel_methods' => ['momo', 'vnpay'],

    'momo' => [
        'endpoint' => env('MOMO_ENDPOINT'),
        'partner_code' => env('MOMO_PARTNER_CODE'),
        'access_key' => env('MOMO_ACCESS_KEY'),
        'secret_key' => env('MOMO_SECRET_KEY'),
        'request_type' => env('MOMO_REQUEST_TYPE', 'payWithATM'),
    ],

    'vnpay' => [
        'tmn_code' => env('VNPAY_TMN_CODE'),
        'hash_secret' => env('VNPAY_HASH_SECRET'),
        'payment_url' => env('VNPAY_PAYMENT_URL', 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html'),
        'bank_code' => env('VNPAY_BANK_CODE'),
    ],
];
