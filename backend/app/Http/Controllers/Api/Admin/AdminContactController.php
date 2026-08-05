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
    public function index(Request $request)
    {
        $sortDirection = $request->string('sort')->toString() === 'oldest' ? 'asc' : 'desc';
        $statusCounts = Contact::query()
            ->selectRaw("COUNT(*) as total_count")
            ->selectRaw("SUM(status = 'pending') as pending_count")
            ->selectRaw("SUM(status = 'resolved') as resolved_count")
            ->first();

        $query = Contact::with([
            'customerAccount:id,email,fullName,avatar_url',
            'repliedBy:id,fullname,avatar_url',
        ])->orderBy('created_at', $sortDirection)
            ->when(
                $request->filled('status') && in_array($request->string('status')->toString(), ['pending', 'resolved'], true),
                fn ($contacts) => $contacts->where('status', $request->string('status')->toString())
            )
            ->when($request->filled('search'), function ($contacts) use ($request) {
                $search = trim($request->string('search')->toString());

                $contacts->where(function ($query) use ($search) {
                    $query->where('fullname', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('message', 'like', "%{$search}%");
                });
            });

        $contacts = $query->paginate(15);

        return response()->json([
            'status' => true,
            'data' => $contacts,
            'status_counts' => [
                'all' => (int) $statusCounts->total_count,
                'pending' => (int) $statusCounts->pending_count,
                'resolved' => (int) $statusCounts->resolved_count,
            ],
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

        $replyMessage = $this->sanitizeReplyHtml($request->message);

        $replyText = html_entity_decode(strip_tags($replyMessage), ENT_QUOTES | ENT_HTML5, 'UTF-8');

        if (trim(str_replace("\xC2\xA0", ' ', $replyText)) === '') {
            return response()->json([
                'status' => false,
                'message' => 'Nội dung phản hồi không được để trống.',
            ], 422);
        }

        try {
            $data = [
                'customerName' => e($contact->fullname),
                'replyMessage' => $replyMessage,
                'originalMessage' => e($contact->message),
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
                                        {$data['replyMessage']}
                                    </div>
                                    <p style='font-size: 12px; color: #999;'>Tin nhắn gốc của bạn: \"{$data['originalMessage']}\"</p>
                                </div>
                            </div>
                        ");
            });

        } catch (\Throwable $exception) {
            Log::error('Không thể gửi email phản hồi liên hệ.', [
                'contact_id' => $contact->id,
                'error' => $exception->getMessage(),
            ]);

            return response()->json(['status' => false, 'message' => 'Gửi email phản hồi thất bại.'], 500);
        }

        try {
            $contact->update([
                'status' => 'resolved',
                'reply_subject' => $request->subject,
                'reply_message' => $replyMessage,
                'replied_at' => now(),
                'replied_by' => $request->user()?->id,
            ]);
        } catch (\Throwable $exception) {
            Log::error('Email phản hồi đã gửi nhưng không thể lưu lịch sử liên hệ.', [
                'contact_id' => $contact->id,
                'error' => $exception->getMessage(),
            ]);

            return response()->json([
                'status' => false,
                'message' => 'Email đã gửi nhưng chưa thể lưu lịch sử phản hồi. Vui lòng kiểm tra lại trước khi gửi lại.',
            ], 500);
        }

        return response()->json(['status' => true, 'message' => 'Đã gửi email phản hồi thành công!']);
    }

    /**
     * Chỉ lưu HTML cơ bản từ trình soạn thảo; không cho phép thuộc tính, script hay style.
     */
    private function sanitizeReplyHtml(string $message): string
    {
        $allowedTags = '<p><br><strong><b><em><i><u><s><ol><ul><li><blockquote>';
        $sanitized = strip_tags($message, $allowedTags);

        return preg_replace('/<([a-z][a-z0-9]*)\\b[^>]*>/i', '<$1>', $sanitized) ?? '';
    }
}
