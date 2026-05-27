<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Services\AiChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ChatbotController extends Controller
{
    public function chat(Request $request, AiChatService $aiChatService)
    {
        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        try {
            $userMessage = trim($request->message);
            $analysis = $this->analyzeSafely($aiChatService, $userMessage);

            if (($analysis['intent'] ?? null) === 'gold_price' || ($analysis === [] && $this->hasGoldPriceIntent($userMessage))) {
                return response()->json([
                    'success' => true,
                    'reply' => nl2br(e($this->buildGoldPriceReply($userMessage, $analysis))),
                    'options' => [
                        ['label' => 'Xem bảng giá vàng', 'link' => '/gia-vang'],
                    ],
                    'products' => [],
                ]);
            }

            $products = collect();

            if (($analysis['intent'] ?? null) === 'product_search' || ($analysis === [] && $this->hasProductIntent($userMessage))) {
                $products = $this->findRecommendedProducts($userMessage, $analysis);
            }

            $botReply = $products->isNotEmpty()
                ? (($analysis['reply_hint'] ?? '') ?: 'Dạ, SORA tìm thấy một số sản phẩm phù hợp với nhu cầu của Quý khách:')
                : $aiChatService->reply($userMessage);

            return response()->json([
                'success' => true,
                'reply' => nl2br(e($botReply)),
                'options' => [],
                'products' => $products->values(),
            ]);
        } catch (\Throwable $e) {
            Log::error('AI Chatbot Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'reply' => 'Dạ, hệ thống SORA đang bận. Quý khách vui lòng thử lại sau.',
                'options' => [],
                'products' => [],
            ], 500);
        }
    }

    private function analyzeSafely(AiChatService $aiChatService, string $message): array
    {
        try {
            return $aiChatService->analyzeMessage($message);
        } catch (\Throwable $e) {
            Log::warning('AI intent analysis failed: ' . $e->getMessage());

            return [];
        }
    }

    private function findRecommendedProducts(string $message, array $analysis = [])
    {
        $terms = $this->extractSearchTerms($message, $analysis);
        $priceFilter = $this->extractPriceFilter($message, $analysis);

        if (empty($terms) && empty($priceFilter)) {
            return collect();
        }

        $products = Product::select([
                'id',
                'category_id',
                'brand_id',
                'name',
                'slug',
                'base_price',
                'promotional_price',
                'thumbnail_image',
                'is_featured',
                'status',
                'created_at',
            ])
            ->with([
                'category:id,name,slug,parent_id',
                'brand:id,name,slug',
                'variants' => function ($variantQuery) {
                    $variantQuery->select('id', 'product_id', 'image_url', 'stock_quantity')
                        ->where('stock_quantity', '>', 0);
                },
            ])
            ->where('status', 'published')
            ->whereHas('variants', function ($variantQuery) {
                $variantQuery->where('stock_quantity', '>', 0);
            })
            ->when(!empty($terms), function ($query) use ($terms) {
                $query->where(function ($productQuery) use ($terms) {
                    foreach ($terms as $term) {
                        $productQuery->orWhere('name', 'like', '%' . $term . '%')
                            ->orWhere('description', 'like', '%' . $term . '%')
                            ->orWhereHas('category', function ($categoryQuery) use ($term) {
                                $categoryQuery->where('name', 'like', '%' . $term . '%')
                                    ->orWhere('slug', 'like', '%' . $term . '%');
                            })
                            ->orWhereHas('brand', function ($brandQuery) use ($term) {
                                $brandQuery->where('name', 'like', '%' . $term . '%')
                                    ->orWhere('slug', 'like', '%' . $term . '%');
                            })
                            ->orWhereHas('variants.attributeValues', function ($attributeValueQuery) use ($term) {
                                $attributeValueQuery->where('value', 'like', '%' . $term . '%');
                            });
                    }
                });
            })
            ->when(isset($priceFilter['min']), function ($query) use ($priceFilter) {
                $query->whereRaw('COALESCE(promotional_price, base_price) >= ?', [$priceFilter['min']]);
            })
            ->when(isset($priceFilter['max']), function ($query) use ($priceFilter) {
                $query->whereRaw('COALESCE(promotional_price, base_price) <= ?', [$priceFilter['max']]);
            })
            ->limit(12)
            ->get();

        return $products
            ->map(function ($product) use ($terms) {
                $product->is_new = $product->created_at >= now()->subDays(30);
                $product->hover_image = optional($product->variants->first(function ($variant) use ($product) {
                    return !empty($variant->image_url) && $variant->image_url !== $product->thumbnail_image;
                }))->image_url;

                $product->match_score = $this->scoreProductMatch($product, $terms);

                return $product;
            })
            ->sortByDesc('match_score')
            ->take(4)
            ->values()
            ->map(function ($product) {
                unset($product->match_score);

                return $product;
            });
    }

    private function hasProductIntent(string $message): bool
    {
        $normalized = mb_strtolower($message, 'UTF-8');
        $keywords = [
            'sản phẩm', 'san pham', 'mua', 'tìm', 'tim', 'gợi ý', 'goi y', 'tư vấn', 'tu van',
            'nhẫn', 'nhan', 'dây chuyền', 'day chuyen', 'vòng', 'vong', 'lắc', 'lac',
            'bông tai', 'bong tai', 'khuyên tai', 'khuyen tai',
            'kim cương', 'kim cuong', 'trang sức', 'trang suc', 'bạc', 'bac',
        ];

        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function hasGoldPriceIntent(string $message): bool
    {
        $normalized = mb_strtolower($message, 'UTF-8');

        $hasGoldWord = str_contains($normalized, 'vàng')
            || str_contains($normalized, 'vang')
            || str_contains($normalized, '99.99')
            || str_contains($normalized, '9999')
            || str_contains($normalized, 'sjc')
            || str_contains($normalized, 'doji');

        if (!$hasGoldWord) {
            return false;
        }

        $priceKeywords = [
            'giá', 'gia', 'bảng giá', 'bang gia', 'hôm nay', 'hom nay', 'hiện tại', 'hien tai',
            'nguyên liệu', 'nguyen lieu', 'mua vào', 'mua vao', 'bán ra', 'ban ra',
            'niêm yết', 'niem yet', 'thị trường', 'thi truong',
        ];

        foreach ($priceKeywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return true;
            }
        }

        return false;
    }

    private function buildGoldPriceReply(string $message, array $analysis = []): string
    {
        $goldPrices = collect(Cache::get('sora_gold_prices', []));
        $lastUpdated = Cache::get('sora_gold_last_updated', '');

        if ($goldPrices->isEmpty()) {
            return "Dạ, hiện tại SORA chưa có dữ liệu bảng giá vàng trong hệ thống.\nQuý khách có thể bấm nút bên dưới để mở trang bảng giá vàng và thử tải lại sau ạ.";
        }

        $terms = $this->extractGoldPriceTerms($message, $analysis);
        $matchedPrices = $goldPrices;

        if (!empty($terms)) {
            $matchedPrices = $goldPrices
                ->map(function ($gold) use ($terms) {
                    $name = mb_strtolower($gold['name'] ?? '', 'UTF-8');
                    $score = 0;

                    foreach ($terms as $term) {
                        if (str_contains($name, $term)) {
                            $score += in_array($term, ['nguyên liệu', 'nguyen lieu'], true) ? 5 : 3;
                        }
                    }

                    $gold['match_score'] = $score;

                    return $gold;
                })
                ->filter(function ($gold) {
                    return ($gold['match_score'] ?? 0) > 0;
                })
                ->sortByDesc('match_score')
                ->values();
        }

        if ((in_array('nguyên liệu', $terms, true) || in_array('nguyen lieu', $terms, true)) && !$matchedPrices->isEmpty()) {
            $materialMatches = $matchedPrices->filter(function ($gold) {
                $name = mb_strtolower($gold['name'] ?? '', 'UTF-8');

                return str_contains($name, 'nguyên liệu') || str_contains($name, 'nguyen lieu');
            });

            if (!$materialMatches->isEmpty()) {
                $matchedPrices = $materialMatches;
            }
        }

        $matchedPrices = $matchedPrices->isEmpty()
            ? $goldPrices->take(5)
            : $matchedPrices->take(3);

        $lines = [];
        $lines[] = 'Dạ, đây là thông tin giá vàng SORA đang có:';
        if (!empty($lastUpdated)) {
            $lines[] = 'Cập nhật: ' . $lastUpdated;
        }
        $lines[] = 'Đơn vị: Nghìn VNĐ / Chỉ.';
        $lines[] = '';

        foreach ($matchedPrices as $gold) {
            $lines[] = '- ' . ($gold['name'] ?? 'Vàng') . ': mua vào ' . ($gold['buy'] ?? '-') . ', bán ra ' . ($gold['sell'] ?? '-') . '.';
        }

        $lines[] = '';
        $lines[] = 'Bảng giá chỉ mang tính tham khảo trực tuyến. Quý khách vui lòng liên hệ SORA Jewelry để chốt giao dịch.';

        return implode("\n", $lines);
    }

    private function extractGoldPriceTerms(string $message, array $analysis = []): array
    {
        $normalized = mb_strtolower($message, 'UTF-8');
        $terms = array_map(function ($term) {
            return mb_strtolower(trim($term), 'UTF-8');
        }, $analysis['gold_terms'] ?? []);

        if (str_contains($normalized, '99.99') || str_contains($normalized, '9999')) {
            $terms[] = '99.99';
            $terms[] = '9999';
        }

        if (str_contains($normalized, 'nguyên liệu') || str_contains($normalized, 'nguyen lieu')) {
            $terms[] = 'nguyên liệu';
            $terms[] = 'nguyen lieu';
        }

        foreach (['sjc', 'doji', 'nhẫn', 'nhan', 'miếng', 'mieng'] as $term) {
            if (str_contains($normalized, $term)) {
                $terms[] = $term;
            }
        }

        return array_values(array_unique(array_filter($terms)));
    }

    private function extractSearchTerms(string $message, array $analysis = []): array
    {
        $aiTerms = array_values(array_unique(array_filter(array_map(function ($term) {
            return mb_strtolower(trim($term), 'UTF-8');
        }, $analysis['product_terms'] ?? []))));

        if (!empty($aiTerms)) {
            return array_slice($aiTerms, 0, 6);
        }

        $normalized = mb_strtolower($message, 'UTF-8');
        $normalized = preg_replace('/[^\p{L}\p{N}\s]+/u', ' ', $normalized);
        $words = preg_split('/\s+/u', $normalized, -1, PREG_SPLIT_NO_EMPTY);
        $stopWords = [
            'toi', 'tôi', 'minh', 'mình', 'ban', 'bạn', 'can', 'cần', 'muon', 'muốn',
            'tim', 'tìm', 'mua', 'cho', 'xem', 'san', 'pham', 'sản', 'phẩm',
            'goi', 'gợi', 'ý', 'y', 'tu', 'van', 'tư', 'vấn', 'co', 'có', 'khong', 'không',
            'nao', 'nào', 'gi', 'gì', 'mot', 'một', 'vai', 'vài', 'hay', 'hãy',
            'duoi', 'dưới', 'tren', 'trên', 'den', 'đến', 'toi', 'tới', 'tu', 'từ',
            'tr', 'trieu', 'triệu', 'gia', 'giá', 'tam', 'tầm', 'khoang', 'khoảng',
        ];

        $terms = array_values(array_unique(array_filter($words, function ($word) use ($stopWords) {
            if (preg_match('/^\d+(?:tr|trieu|triệu|m|k)?$/u', $word)) {
                return false;
            }

            return mb_strlen($word, 'UTF-8') >= 2 && !in_array($word, $stopWords, true);
        })));

        return array_slice($terms, 0, 6);
    }

    private function extractPriceFilter(string $message, array $analysis = []): array
    {
        $filter = [];

        if (isset($analysis['price_min'])) {
            $filter['min'] = (int) $analysis['price_min'];
        }

        if (isset($analysis['price_max'])) {
            $filter['max'] = (int) $analysis['price_max'];
        }

        if (!empty($filter)) {
            return $filter;
        }

        $normalized = mb_strtolower($message, 'UTF-8');
        $normalized = str_replace(',', '.', $normalized);
        $number = '(\d+(?:\.\d+)?)\s*(tr|triệu|trieu|m|k|nghìn|nghin|000)?';

        if (preg_match('/(?:từ|tu)\s*' . $number . '\s*(?:đến|den|tới|toi|-)\s*' . $number . '/u', $normalized, $matches)) {
            return [
                'min' => $this->normalizePriceValue($matches[1], $matches[2] ?? null),
                'max' => $this->normalizePriceValue($matches[3], $matches[4] ?? null),
            ];
        }

        if (preg_match('/(?:dưới|duoi|nhỏ hơn|nho hon|không quá|khong qua|tối đa|toi da|<=|<)\s*' . $number . '/u', $normalized, $matches)) {
            return ['max' => $this->normalizePriceValue($matches[1], $matches[2] ?? null)];
        }

        if (preg_match('/' . $number . '\s*(?:trở xuống|tro xuong|đổ lại|do lai)/u', $normalized, $matches)) {
            return ['max' => $this->normalizePriceValue($matches[1], $matches[2] ?? null)];
        }

        if (preg_match('/(?:trên|tren|lớn hơn|lon hon|tối thiểu|toi thieu|>=|>)\s*' . $number . '/u', $normalized, $matches)) {
            return ['min' => $this->normalizePriceValue($matches[1], $matches[2] ?? null)];
        }

        if (preg_match('/' . $number . '\s*(?:trở lên|tro len)/u', $normalized, $matches)) {
            return ['min' => $this->normalizePriceValue($matches[1], $matches[2] ?? null)];
        }

        return [];
    }

    private function normalizePriceValue(string $value, ?string $unit): int
    {
        $number = (float) $value;
        $unit = mb_strtolower($unit ?? '', 'UTF-8');

        if (in_array($unit, ['tr', 'triệu', 'trieu', 'm'], true)) {
            return (int) round($number * 1000000);
        }

        if (in_array($unit, ['k', 'nghìn', 'nghin'], true)) {
            return (int) round($number * 1000);
        }

        if ($number < 1000) {
            return (int) round($number * 1000000);
        }

        return (int) round($number);
    }

    private function scoreProductMatch(Product $product, array $terms): int
    {
        $name = mb_strtolower($product->name ?? '', 'UTF-8');
        $category = mb_strtolower($product->category->name ?? '', 'UTF-8');
        $brand = mb_strtolower($product->brand->name ?? '', 'UTF-8');
        $score = 0;

        foreach ($terms as $term) {
            if (str_contains($name, $term)) {
                $score += 5;
            }
            if (str_contains($category, $term)) {
                $score += 3;
            }
            if (str_contains($brand, $term)) {
                $score += 2;
            }
        }

        return $score + (int) $product->is_featured;
    }
}
