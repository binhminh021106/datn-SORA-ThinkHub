<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Contact;
use App\Events\NewContactSubmitted; // 👉 IMPORT SỰ KIỆN VỪA TẠO

class ClientContactController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fullname' => 'required|string|max:150',
            'phone'    => 'required|string|max:20',
            'email'    => 'required|email|max:150',
            'message'  => 'required|string|max:2000',
        ]);

        // Lưu thông tin vào Database
        $contact = Contact::create([
            'fullname' => $request->fullname,
            'phone'    => $request->phone,
            'email'    => $request->email,
            'message'  => $request->message,
            'status'   => 'pending', // Mặc định là chờ Admin xử lý
        ]);

        // 👉 BẮN SỰ KIỆN REAL-TIME CHO ADMIN NGAY LẬP TỨC
        broadcast(new NewContactSubmitted($contact));

        // Sếp có thể thêm logic gửi Email tự động thông báo cho Admin ở đây sau này

        return response()->json([
            'status' => true,
            'message' => 'Gửi lời nhắn thành công! Chuyên viên SORA sẽ sớm liên hệ với bạn.'
        ]);
    }
}