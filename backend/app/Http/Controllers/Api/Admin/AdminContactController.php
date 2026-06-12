<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail; 
use Illuminate\Support\Facades\Log;

class AdminContactController extends Controller
{
    /**
     * Lấy danh sách liên hệ (Mới nhất lên đầu)
     */
    public function index()
    {
        $contacts = Contact::orderByRaw("FIELD(status, 'pending', 'resolved')")
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'status' => true,
            'data' => $contacts
        ]);
    }

    /**
     * Cập nhật trạng thái
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate(['status' => 'required|in:pending,resolved']);

        $contact = Contact::find($id);
        if (!$contact) return response()->json(['status' => false, 'message' => 'Không tìm thấy liên hệ'], 404);

        $contact->status = $request->status;
        $contact->save();

        return response()->json(['status' => true, 'message' => 'Đã cập nhật trạng thái thành công!']);
    }

    /**
     * Xóa 1 tin nhắn
     */
    public function destroy($id)
    {
        $contact = Contact::find($id);
        if (!$contact) return response()->json(['status' => false, 'message' => 'Không tìm thấy liên hệ'], 404);

        $contact->delete();
        return response()->json(['status' => true, 'message' => 'Đã xóa tin nhắn liên hệ!']);
    }

    /**
     * XÓA HÀNG LOẠT (Tính năng mới cho các ô tích chọn)
     */
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:contacts,id'
        ]);

        Contact::whereIn('id', $request->ids)->delete();

        return response()->json([
            'status' => true,
            'message' => 'Đã xóa các liên hệ được chọn thành công!'
        ]);
    }

    /**
     * TRẢ LỜI EMAIL CHO KHÁCH
     */
    public function replyEmail(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $contact = Contact::find($id);
        if (!$contact) return response()->json(['status' => false, 'message' => 'Không tìm thấy liên hệ'], 404);

        try {
            $data = [
                'customerName' => $contact->fullname,
                'replyMessage' => $request->message,
                'originalMessage' => $contact->message
            ];

            // Gửi Email
            Mail::send([], [], function ($message) use ($contact, $request, $data) {
                $message->to($contact->email)
                        ->subject($request->subject)
                        ->html("
                            <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;'>
                                <div style='background-color: #9f273b; padding: 20px; text-align: center;'>
                                    <h2 style='color: white; margin: 0;'>SORA JEWELRY</h2>
                                </div>
                                <div style='padding: 20px;'>
                                    <p>Chào <strong>{$data['customerName']}</strong>,</p>
                                    <p>SORA xin phản hồi thắc mắc của bạn:</p>
                                    <div style='background: #f9f9f9; padding: 15px; border-left: 4px solid #e7ce7d; margin: 15px 0;'>
                                        " . nl2br(htmlspecialchars($data['replyMessage'])) . "
                                    </div>
                                    <p style='font-size: 12px; color: #999;'>Tin nhắn gốc của bạn: \"{$data['originalMessage']}\"</p>
                                </div>
                            </div>
                        ");
            });

            // Cập nhật trạng thái
            $contact->status = 'resolved';
            $contact->save();

            return response()->json(['status' => true, 'message' => 'Đã gửi email phản hồi thành công!']);

        } catch (\Exception $e) {
            Log::error('Lỗi gửi mail: ' . $e->getMessage()); 
            return response()->json(['status' => false, 'message' => 'Gửi mail thất bại.'], 500);
        }
    }
}