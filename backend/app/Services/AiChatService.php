<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

class AiChatService
{
    public function reply(string $message): string
    {
        $apiKey = config('services.ai.key');

        if (empty($apiKey)) {
            throw new RuntimeException('AI_API_KEY is not configured.');
        }

        return match (config('services.ai.provider')) {
            'freemodel', 'openai_compatible' => $this->replyWithOpenAiCompatible($message),
            default => throw new RuntimeException('Unsupported AI provider.'),
        };
    }

    public function analyzeMessage(string $message): array
    {
        $apiKey = config('services.ai.key');

        if (empty($apiKey)) {
            throw new RuntimeException('AI_API_KEY is not configured.');
        }

        return match (config('services.ai.provider')) {
            'freemodel', 'openai_compatible' => $this->analyzeWithOpenAiCompatible($message),
            default => throw new RuntimeException('Unsupported AI provider.'),
        };
    }

    private function replyWithOpenAiCompatible(string $message): string
    {
        $response = $this->postChatCompletions([
            [
                'role' => 'system',
                'content' => 'Bạn là trợ lý tư vấn của SORA, cửa hàng trang sức. Trả lời ngắn gọn, lịch sự, đúng trọng tâm và bằng tiếng Việt. Nếu khách hỏi về tồn kho, giá chính xác, đơn hàng hoặc chính sách chưa rõ, hãy hướng dẫn khách liên hệ nhân viên hỗ trợ.',
            ],
            [
                'role' => 'user',
                'content' => $message,
            ],
        ], 0.4);

        $reply = data_get($response, 'choices.0.message.content');

        if (!is_string($reply) || trim($reply) === '') {
            throw new RuntimeException('AI API returned an empty reply.');
        }

        return trim($reply);
    }

    private function analyzeWithOpenAiCompatible(string $message): array
    {
        $response = $this->postChatCompletions([
            [
                'role' => 'system',
                'content' => implode("\n", [
                    'Bạn là bộ phân tích intent cho chatbot SORA Jewelry.',
                    'Chỉ trả về JSON hợp lệ, không markdown, không giải thích.',
                    'Schema:',
                    '{',
                    '  "intent": "product_search" | "gold_price" | "general",',
                    '  "product_terms": ["từ khóa sản phẩm, ví dụ nhẫn, dây chuyền, kim cương"],',
                    '  "price_min": number | null,',
                    '  "price_max": number | null,',
                    '  "gold_terms": ["từ khóa giá vàng, ví dụ nguyên liệu, 99.99, SJC"],',
                    '  "reply_hint": "câu dẫn ngắn bằng tiếng Việt"',
                    '}',
                    'Phân loại:',
                    '- gold_price: hỏi bảng giá vàng, giá vàng hôm nay, vàng nguyên liệu, SJC, DOJI, mua vào/bán ra.',
                    '- product_search: muốn tìm/mua/gợi ý/xem sản phẩm trang sức trong cửa hàng.',
                    '- general: các câu hỏi còn lại.',
                    'Nếu hỏi "vàng nguyên liệu 99.99 giá hôm nay" thì intent phải là gold_price, không phải product_search.',
                    'Nếu hỏi "nhẫn vàng dưới 50tr" thì intent là product_search, product_terms gồm nhẫn/vàng, price_max là 50000000.',
                    'Quy đổi giá: 50tr hoặc 50 triệu = 50000000.',
                ]),
            ],
            [
                'role' => 'user',
                'content' => $message,
            ],
        ], 0);

        $content = data_get($response, 'choices.0.message.content');

        if (!is_string($content) || trim($content) === '') {
            throw new RuntimeException('AI API returned an empty analysis.');
        }

        $content = trim($content);
        $content = preg_replace('/^```(?:json)?\s*/i', '', $content);
        $content = preg_replace('/\s*```$/', '', $content);

        $analysis = json_decode($content, true);

        if (!is_array($analysis)) {
            throw new RuntimeException('AI API returned invalid analysis JSON: ' . $content);
        }

        return [
            'intent' => in_array($analysis['intent'] ?? null, ['product_search', 'gold_price', 'general'], true)
                ? $analysis['intent']
                : 'general',
            'product_terms' => array_values(array_filter($analysis['product_terms'] ?? [], 'is_string')),
            'price_min' => is_numeric($analysis['price_min'] ?? null) ? (int) $analysis['price_min'] : null,
            'price_max' => is_numeric($analysis['price_max'] ?? null) ? (int) $analysis['price_max'] : null,
            'gold_terms' => array_values(array_filter($analysis['gold_terms'] ?? [], 'is_string')),
            'reply_hint' => is_string($analysis['reply_hint'] ?? null) ? trim($analysis['reply_hint']) : '',
        ];
    }

    private function postChatCompletions(array $messages, float $temperature): array
    {
        $response = Http::timeout(config('services.ai.timeout'))
            ->withToken(config('services.ai.key'))
            ->acceptJson()
            ->post(config('services.ai.base_url') . '/chat/completions', [
                'model' => config('services.ai.model'),
                'messages' => $messages,
                'temperature' => $temperature,
            ]);

        if ($response->failed()) {
            throw new RuntimeException('AI API request failed: ' . $response->body());
        }

        return $response->json();
    }
}
