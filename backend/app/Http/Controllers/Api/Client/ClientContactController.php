<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Contact;
use App\Events\NewContactSubmitted;
use Illuminate\Support\Facades\Cache;

class ClientContactController extends Controller
{
    public function store(Request $request)
    {
        // 1. Kiểm tra khóa chống spam (24 giờ) theo IP hoặc Email
        $lockKeyIp = 'contact_lock_ip_' . $request->ip();
        $emailInput = strtolower(trim($request->input('email', '')));
        $lockKeyEmail = 'contact_lock_email_' . $emailInput;

        if (Cache::has($lockKeyIp) || ($emailInput !== '' && Cache::has($lockKeyEmail))) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã gửi lời nhắn thành công trước đó. Vui lòng thử lại sau 24 giờ hoặc liên hệ trực tiếp qua hotline.'
            ], 429);
        }

        // 2. Validate dữ liệu khắt khe (CHẠY TRƯỚC KHI TÍNH LƯỢT RATE LIMIT)
        $request->validate([
            'g-recaptcha-response' => ['required', new \App\Rules\Recaptcha],
            'fullname' => 'required|string|min:2|max:150',
            'phone'    => ['required', 'string', 'regex:/^(0[3|5|7|8|9])+([0-9]{8})$/'], // Đúng chuẩn SĐT Việt Nam
            'email'    => [
                'required',
                'email:rfc,dns', // Phải đúng định dạng RFC và Tên miền phải có bản ghi MX/A
                'max:150',
                function ($attribute, $value, $fail) {
                    $invalidPrefixes = ['abc@', 'test@', '123@', 'admin@', 'spam@', 'fake@'];
                    $lowerValue = strtolower($value);
                    foreach ($invalidPrefixes as $prefix) {
                        if (str_starts_with($lowerValue, $prefix)) {
                            $fail('Địa chỉ email không hợp lệ hoặc có dấu hiệu spam.');
                            return;
                        }
                    }
                },
            ],
            'message'  => 'required|string|min:10|max:2000',
        ], [
            'g-recaptcha-response.required' => 'Vui lòng xác minh bạn không phải là robot (Tích vào ô I am not a robot).',
            'phone.regex' => 'Số điện thoại không hợp lệ (phải là 10 số và bắt đầu bằng 03, 05, 07, 08, 09).',
            'message.min' => 'Nội dung lời nhắn quá ngắn, vui lòng nhập ít nhất 10 ký tự.'
        ]);

        // 3. Khóa Spam (3 lần / giờ) CHỈ DÀNH CHO FORM ĐÃ PASS VALIDATE
        $throttleKey = 'contact_valid_' . $request->ip();
        if (\Illuminate\Support\Facades\RateLimiter::tooManyAttempts($throttleKey, 3)) {
            return response()->json([
                'status' => false,
                'message' => 'Bạn đã gửi liên hệ quá nhiều lần. Vui lòng thử lại sau 1 giờ.'
            ], 429);
        }
        \Illuminate\Support\Facades\RateLimiter::hit($throttleKey, 3600); // Lưu lượt trong 1 giờ

        // 4. Lưu thông tin vào Database
        $contact = Contact::create([
            'fullname' => $request->fullname,
            'phone'    => $request->phone,
            'email'    => $request->email,
            'message'  => $request->message,
            'status'   => 'pending', // Mặc định là chờ Admin xử lý
        ]);

        // 👉 BẮN SỰ KIỆN REAL-TIME CHO ADMIN NGAY LẬP TỨC
        broadcast(new NewContactSubmitted($contact));

        // 3. Khóa IP và Email trong 24 giờ sau khi GỬI THÀNH CÔNG
        Cache::put($lockKeyIp, true, now()->addDays(1));
        Cache::put($lockKeyEmail, true, now()->addDays(1));

        return response()->json([
            'status' => true,
            'message' => 'Gửi lời nhắn thành công! Chuyên viên SORA sẽ sớm liên hệ với bạn.'
        ]);
    }
}