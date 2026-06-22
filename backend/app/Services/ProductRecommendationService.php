<?php

namespace App\Services;

use App\Models\Cart;
use App\Models\Favourite;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProductRecommendationService
{
    public function recommend(?User $user, int $limit = 10): array
    {
        $limit = min(max($limit, 4), 20);
        $cacheKey = $user
            ? "personalized_recommendations:user:{$user->id}:{$this->profileVersion($user)}:limit:{$limit}"
            : "personalized_recommendations:guest:limit:{$limit}";

        return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($user, $limit) {
            $profile = $this->buildUserProfile($user);
            $candidates = $this->buildCandidates($profile, max($limit * 3, 18));

            if ($candidates->isEmpty()) {
                return [
                    'mode' => $user ? 'personalized' : 'popular',
                    'reason' => 'Chưa có sản phẩm phù hợp để gợi ý.',
                    'products' => [],
                ];
            }

            $rankedProducts = $this->rankWithAi($profile, $candidates, $limit)
                ?? $this->rankWithRules($profile, $candidates, $limit);

            return [
                'mode' => $user && $profile['has_signal'] ? 'personalized' : 'popular',
                'reason' => $user && $profile['has_signal']
                    ? 'Dựa trên giỏ hàng, sản phẩm yêu thích hoặc đơn hàng gần đây của bạn.'
                    : 'Gợi ý từ các sản phẩm nổi bật và được quan tâm tại SORA.',
                'products' => $rankedProducts->values()->all(),
            ];
        });
    }

    private function profileVersion(User $user): string
    {
        $favouriteVersion = Favourite::where('user_id', $user->id)->max('updated_at') ?: 'no-fav';
        $orderVersion = OrderItem::whereHas('order', fn ($query) => $query->where('user_id', $user->id))->max('id') ?: 'no-order';
        $cart = Cart::where('user_id', $user->id)->first();
        $cartVersion = $cart
            ? ($cart->items()->max('updated_at') ?: $cart->updated_at ?: $cart->id)
            : 'no-cart';

        return md5($favouriteVersion . '|' . $orderVersion . '|' . $cartVersion);
    }

    private function buildUserProfile(?User $user): array
    {
        if (!$user) {
            return [
                'has_signal' => false,
                'category_ids' => [],
                'product_ids' => [],
                'average_price' => null,
                'keywords' => [],
            ];
        }

        $orderProductIds = OrderItem::query()
            ->whereHas('order', fn ($query) => $query->where('user_id', $user->id))
            ->whereNotNull('product_id')
            ->latest('id')
            ->limit(30)
            ->pluck('product_id')
            ->all();

        $favouriteProductIds = Favourite::where('user_id', $user->id)
            ->latest('id')
            ->limit(30)
            ->pluck('product_id')
            ->all();

        $cartProductIds = Cart::where('user_id', $user->id)
            ->with('items.variant:id,product_id')
            ->first()
            ?->items
            ->pluck('variant.product_id')
            ->filter()
            ->values()
            ->all() ?? [];

        $productIds = array_values(array_unique(array_filter([
            ...$cartProductIds,
            ...$favouriteProductIds,
            ...$orderProductIds,
        ])));

        $products = Product::with('category:id,name')
            ->whereIn('id', $productIds)
            ->get(['id', 'category_id', 'name', 'base_price', 'promotional_price']);

        $prices = $products
            ->map(fn ($product) => (float) ($product->promotional_price ?: $product->base_price))
            ->filter(fn ($price) => $price > 0)
            ->values();

        return [
            'has_signal' => count($productIds) > 0,
            'category_ids' => $products->pluck('category_id')->filter()->unique()->values()->all(),
            'product_ids' => $productIds,
            'average_price' => $prices->isNotEmpty() ? (int) round($prices->avg()) : null,
            'keywords' => $products
                ->pluck('category.name')
                ->merge($products->pluck('name'))
                ->filter()
                ->take(12)
                ->values()
                ->all(),
        ];
    }

    private function buildCandidates(array $profile, int $limit): Collection
    {
        $query = Product::with([
                'category:id,name,slug,parent_id',
                'brand:id,name,slug',
                'variants' => function ($variantQuery) {
                    $variantQuery->select('id', 'product_id', 'image_url', 'stock_quantity')
                        ->where('stock_quantity', '>', 0);
                },
            ])
            ->withCount('reviews')
            ->withAvg('reviews', 'rating')
            ->where('status', 'published')
            ->whereHas('variants', fn ($variantQuery) => $variantQuery->where('stock_quantity', '>', 0));

        if (!empty($profile['category_ids'])) {
            $query->orderByRaw(
                'CASE WHEN category_id IN (' . implode(',', array_fill(0, count($profile['category_ids']), '?')) . ') THEN 0 ELSE 1 END',
                $profile['category_ids']
            );
        }

        return $query
            ->orderBy('is_featured', 'desc')
            ->orderBy('id', 'desc')
            ->limit($limit)
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));
    }

    private function rankWithAi(array $profile, Collection $candidates, int $limit): ?Collection
    {
        if (empty(config('services.ai.key')) || !$profile['has_signal']) {
            return null;
        }

        try {
            $response = Http::connectTimeout(3)
                ->timeout(min(max((int) config('services.ai.timeout', 8), 1), 8))
                ->withToken(config('services.ai.key'))
                ->acceptJson()
                ->post(config('services.ai.base_url') . '/chat/completions', [
                    'model' => config('services.ai.model'),
                    'temperature' => 0,
                    'messages' => [
                        [
                            'role' => 'system',
                            'content' => 'Bạn là hệ thống xếp hạng sản phẩm SORA. Chỉ trả về JSON hợp lệ dạng {"product_ids":[1,2,3]}. Không giải thích.',
                        ],
                        [
                            'role' => 'user',
                            'content' => json_encode([
                                'user_profile' => [
                                    'average_price' => $profile['average_price'],
                                    'keywords' => $profile['keywords'],
                                    'preferred_category_ids' => $profile['category_ids'],
                                ],
                                'candidate_products' => $candidates->map(fn ($product) => [
                                    'id' => $product['id'],
                                    'name' => $product['name'],
                                    'category' => $product['category']['name'] ?? null,
                                    'price' => $product['promotional_price'] ?: $product['base_price'],
                                    'rating_avg' => $product['rating_avg'],
                                    'review_count' => $product['review_count'],
                                    'is_featured' => (bool) ($product['is_featured'] ?? false),
                                ])->values()->all(),
                            ], JSON_UNESCAPED_UNICODE),
                        ],
                    ],
                ]);

            if ($response->failed()) {
                throw new \RuntimeException($response->body());
            }

            $content = trim((string) data_get($response->json(), 'choices.0.message.content', ''));
            $content = preg_replace('/^```(?:json)?\s*/i', '', $content);
            $content = preg_replace('/\s*```$/', '', $content);
            $payload = json_decode($content, true);
            $ids = array_values(array_filter($payload['product_ids'] ?? [], 'is_numeric'));

            if (empty($ids)) {
                return null;
            }

            $byId = $candidates->keyBy('id');
            $ranked = collect($ids)
                ->map(fn ($id) => $byId->get((int) $id))
                ->filter()
                ->values();

            return $ranked
                ->merge($candidates->whereNotIn('id', $ranked->pluck('id')->all()))
                ->take($limit)
                ->values();
        } catch (\Throwable $e) {
            Log::warning('AI product recommendation fallback: ' . $e->getMessage());

            return null;
        }
    }

    private function rankWithRules(array $profile, Collection $candidates, int $limit): Collection
    {
        return $candidates
            ->map(function ($product) use ($profile) {
                $price = (float) ($product['promotional_price'] ?: $product['base_price']);
                $score = 0;

                if (in_array($product['category_id'], $profile['category_ids'], true)) {
                    $score += 45;
                }

                if (!empty($profile['average_price']) && $price > 0) {
                    $distance = abs($price - $profile['average_price']) / max($profile['average_price'], 1);
                    $score += max(0, 25 - ($distance * 25));
                }

                $score += !empty($product['is_featured']) ? 12 : 0;
                $score += min(10, (float) ($product['rating_avg'] ?? 0) * 2);
                $score += min(8, (int) ($product['review_count'] ?? 0));

                $product['_recommendation_score'] = $score;

                return $product;
            })
            ->sortByDesc('_recommendation_score')
            ->take($limit)
            ->map(function ($product) {
                unset($product['_recommendation_score']);

                return $product;
            })
            ->values();
    }

    private function formatProduct(Product $product): array
    {
        $hoverImage = optional($product->variants->first(function ($variant) use ($product) {
            return !empty($variant->image_url) && $variant->image_url !== $product->thumbnail_image;
        }))->image_url;

        return [
            'id' => $product->id,
            'category_id' => $product->category_id,
            'brand_id' => $product->brand_id,
            'name' => $product->name,
            'slug' => $product->slug,
            'base_price' => (float) $product->base_price,
            'promotional_price' => (float) $product->promotional_price,
            'thumbnail_image' => $product->thumbnail_image,
            'is_featured' => (bool) $product->is_featured,
            'is_new' => $product->created_at >= now()->subDays(30),
            'hover_image' => $hoverImage,
            'review_count' => (int) ($product->reviews_count ?? 0),
            'rating_avg' => (float) ($product->reviews_avg_rating ?? 0),
            'total_stock' => (int) ($product->variants ? $product->variants->sum('stock_quantity') : 0),
            'category' => $product->category,
            'brand' => $product->brand,
        ];
    }
}
