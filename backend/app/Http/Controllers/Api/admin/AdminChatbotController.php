<?php

namespace App\Http\Controllers\Api\admin;

use App\Http\Controllers\Controller;
use App\Models\ChatbotResponse;
use Illuminate\Http\Request;

class AdminChatbotController extends Controller
{
    public function index()
    {
        $responses = ChatbotResponse::orderBy('created_at', 'desc')->get();
        return response()->json(['success' => true, 'data' => $responses]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'keyword' => 'required|string|unique:chatbot_responses,keyword',
            'reply' => 'required|string',
        ], ['keyword.unique' => 'Từ khóa này đã tồn tại!']);

        // Mã hóa mảng options thành JSON để lưu vào CSDL
        $optionsJson = is_array($request->options) ? json_encode($request->options, JSON_UNESCAPED_UNICODE) : null;

        $item = ChatbotResponse::create([
            'keyword' => mb_strtolower($request->keyword, 'UTF-8'),
            'reply' => $request->reply,
            'options' => $optionsJson
        ]);

        return response()->json(['success' => true, 'data' => $item]);
    }

    public function update(Request $request, $id)
    {
        $item = ChatbotResponse::findOrFail($id);
        $request->validate([
            'keyword' => 'required|string|unique:chatbot_responses,keyword,' . $id,
            'reply' => 'required|string',
        ]);

        $optionsJson = is_array($request->options) ? json_encode($request->options, JSON_UNESCAPED_UNICODE) : null;

        $item->update([
            'keyword' => mb_strtolower($request->keyword, 'UTF-8'),
            'reply' => $request->reply,
            'options' => $optionsJson
        ]);

        return response()->json(['success' => true, 'data' => $item]);
    }

    public function destroy($id)
    {
        ChatbotResponse::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Đã xóa kịch bản!']);
    }
}