<?php

namespace App\Http\Controllers\Api\Client;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Attribute;
use App\Models\AttributeValue;
use Illuminate\Http\Request;

class ShopController extends Controller
{
    public function index(Request $request, $shop_slug)
    {
        $query = Product::with([
            'category:id,name,slug,parent_id',
            'variants' => function ($variantQuery) {
                $variantQuery->where('stock_quantity', '>', 0)
                    ->with('attributeValues.attribute');
            },
        ])
            ->where('status', 'published')
            ->whereHas('variants', function ($variantQuery) {
                $variantQuery->where('stock_quantity', '>', 0);
            });

        if ($request->filled('categories')) {
            $this->applyCategoryScope($query, $request);
        }

        if ($request->filled('keyword')) {
            $query->where('name', 'like', '%' . $request->keyword . '%');
        }

        if ($request->filled('color')) {
            $colorsArr = explode(',', $request->color);
            $query->whereHas('variants', function ($variantQuery) use ($colorsArr) {
                $variantQuery->where('stock_quantity', '>', 0)
                    ->whereHas('attributeValues', function ($attributeValueQuery) use ($colorsArr) {
                        $attributeValueQuery->whereIn('value', $colorsArr)
                            ->whereHas('attribute', function ($attributeQuery) {
                                $attributeQuery->whereIn('name', ['Màu sắc', 'Color', 'Màu', 'color']);
                            });
                    });
            });
        }

        if ($request->filled('attribute_values')) {
            $attrValues = explode(',', $request->attribute_values);
            $query->whereHas('variants', function ($variantQuery) use ($attrValues) {
                $variantQuery->where('stock_quantity', '>', 0)
                    ->whereHas('attributeValues', function ($attributeValueQuery) use ($attrValues) {
                        $attributeValueQuery->whereIn('value', $attrValues);
                    });
            });
        }

        switch ($request->input('sort')) {
            case 'new':
                $query->orderBy('created_at', 'desc');
                break;
            case 'price_asc':
                $query->orderByRaw('COALESCE(promotional_price, base_price) ASC');
                break;
            case 'price_desc':
                $query->orderByRaw('COALESCE(promotional_price, base_price) DESC');
                break;
            case 'recommended':
            default:
                $query->orderBy('is_featured', 'desc')->orderBy('id', 'desc');
                break;
        }

        $products = $query->paginate($request->input('per_page', 12));

        $products->getCollection()->transform(function ($product) {
            $product->is_new = $product->created_at >= now()->subDays(30);
            $product->hover_image = null;

            if ($product->variants && $product->variants->count() > 0) {
                $hoverCandidate = $product->variants->first(function ($variant) use ($product) {
                    return !empty($variant->image_url) && $variant->image_url !== $product->thumbnail_image;
                });
                $product->hover_image = $hoverCandidate ? $hoverCandidate->image_url : null;
            }

            return $product;
        });

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function categories($shop_slug)
    {
        $categories = Category::where('status', 'active')
            ->where(function ($categoryQuery) {
                $categoryQuery->whereHas('products', function ($productQuery) {
                    $productQuery->where('status', 'published')
                        ->whereHas('variants', function ($variantQuery) {
                            $variantQuery->where('stock_quantity', '>', 0);
                        });
                })->orWhereHas('children.products', function ($productQuery) {
                    $productQuery->where('status', 'published')
                        ->whereHas('variants', function ($variantQuery) {
                            $variantQuery->where('stock_quantity', '>', 0);
                        });
                });
            })
            ->orderBy('sort_order', 'asc')
            ->get(['id', 'parent_id', 'name', 'slug', 'thumbnail']);

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function colors(Request $request, $shop_slug)
    {
        $uniqueColors = AttributeValue::whereHas('attribute', function ($attributeQuery) {
                $attributeQuery->whereIn('name', ['Màu sắc', 'Color', 'Màu', 'color']);
            })
            ->whereHas('variants', function ($variantQuery) use ($request) {
                $variantQuery->where('stock_quantity', '>', 0)
                    ->whereHas('product', function ($productQuery) use ($request) {
                        $productQuery->where('status', 'published');
                        $this->applyCategoryScope($productQuery, $request);
                    });
            })
            ->orderBy('value')
            ->distinct()
            ->pluck('value');

        return response()->json(['success' => true, 'data' => $uniqueColors]);
    }

    public function attributes(Request $request, $shop_slug)
    {
        $attributes = Attribute::with(['values' => function ($valueQuery) use ($request) {
                $valueQuery->select('id', 'attribute_id', 'value')
                    ->whereHas('variants', function ($variantQuery) use ($request) {
                        $variantQuery->where('stock_quantity', '>', 0)
                            ->whereHas('product', function ($productQuery) use ($request) {
                                $productQuery->where('status', 'published');
                                $this->applyCategoryScope($productQuery, $request);
                            });
                    })
                    ->orderBy('value');
            }])
            ->whereHas('values.variants', function ($variantQuery) use ($request) {
                $variantQuery->where('stock_quantity', '>', 0)
                    ->whereHas('product', function ($productQuery) use ($request) {
                        $productQuery->where('status', 'published');
                        $this->applyCategoryScope($productQuery, $request);
                    });
            })
            ->get();

        return response()->json(['success' => true, 'data' => $attributes]);
    }

    private function applyCategoryScope($productQuery, Request $request): void
    {
        if (!$request->filled('categories')) {
            return;
        }

        $categoriesArr = explode(',', $request->categories);

        $productQuery->whereHas('category', function ($categoryQuery) use ($categoriesArr) {
            $categoryQuery->whereIn('slug', $categoriesArr)
                ->orWhereHas('parent', function ($parentQuery) use ($categoriesArr) {
                    $parentQuery->whereIn('slug', $categoriesArr);
                });
        });
    }
}
