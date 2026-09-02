<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\ChatbotResponse;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request)
    {
        $request->validate(['message' => 'required|string|max:1000']);
        $userMessage = trim(mb_strtolower($request->message, 'UTF-8'));

        try {
            $query = ChatbotResponse::query();
            $query->whereRaw('? LIKE CONCAT("%", LOWER(keyword), "%")', [$userMessage]);

            if (mb_strlen($userMessage, 'UTF-8') >= 3) {
                $query->orWhereRaw('LOWER(keyword) LIKE CONCAT("%", ?, "%")', [$userMessage]);
            }

            $matchedResponse = $query->orderByRaw('LENGTH(keyword) DESC')->first();
            $options = []; 

            if ($matchedResponse) {
                $botReply = $matchedResponse->reply;
                
                // Giải mã JSON thành mảng
                if (!empty($matchedResponse->options)) {
                    $decoded = json_decode($matchedResponse->options, true);
                    if(is_array($decoded)) $options = $decoded;
                }
            } else {
                $botReply = "Dạ, hiện tại SORA chưa hiểu ý của Quý khách. Quý khách muốn hỏi về chủ đề nào dưới đây ạ?";
                // Các nút mặc định (Label và Link)
                $options = [
                    ['label' => 'Giá vàng', 'link' => ''],
                    ['label' => 'Bảo hành', 'link' => ''],
                    ['label' => 'Xem Cửa Hàng', 'link' => '/shop']
                ];
            }

            sleep(1);
            return response()->json(['success' => true, 'reply' => $botReply, 'options' => $options]);

        } catch (\Exception $e) {
            Log::error('Chatbot Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'reply' => 'Hệ thống đang bận.', 'options' => []], 500);
        }
    }
}