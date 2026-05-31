<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;

class AdminUpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('variants_data')) {
            $variants = json_decode($this->input('variants_data'), true) ?? [];
            foreach ($variants as $index => &$variant) {
                $variant['image_file'] = $this->file("variant_image_{$index}");
                $variant['current_image'] = $variant['current_image'] ?? null;
            }
            $this->merge(['parsed_variants' => $variants]);
        }
    }

    public function rules(): array
    {
        $productId = $this->route('product'); 

        return [
            'category_id'       => 'required|exists:categories,id',
            'brand_id'          => 'nullable|exists:brands,id',
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:products,slug,' . $productId,
            'base_price'        => 'required|numeric|min:0',
            'thumbnail_image'   => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048', 
            'status'            => 'required|in:published,draft,hidden',
            'affiliate_commission_rate' => 'nullable|numeric|min:0|max:100',
            'parsed_variants'   => 'required|array|min:1',
            
            // Xử lý khó nhất: Bỏ qua check Unique SKU nếu ID của SKU đó là của chính nó
            'parsed_variants.*.sku' => ['required', 'string', 'distinct', function($attribute, $value, $fail) {
                $index = explode('.', $attribute)[1];
                $variantId = $this->input("parsed_variants.{$index}.id");
                
                $query = DB::table('product_variants')->where('sku', $value)->whereNull('deleted_at');
                if ($variantId) {
                    $query->where('id', '!=', $variantId); // Bỏ qua id hiện tại
                }
                
                if($query->exists()) {
                    $fail("Mã SKU {$value} đã tồn tại trên hệ thống.");
                }
            }],
            
            'parsed_variants.*.price'             => 'required|numeric|min:0',
            'parsed_variants.*.promotional_price' => 'nullable|numeric|min:0|lte:parsed_variants.*.price',
            'parsed_variants.*.stock_quantity'    => 'required|integer|min:0',
            
            // YÊU CẦU ẢNH: Chỉ bắt buộc nếu biến thể này chưa có ảnh cũ (current_image rỗng)
            'parsed_variants.*.image_file'        => 'required_without:parsed_variants.*.current_image|nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'slug.unique' => 'Sản phẩm (slug) này đã tồn tại trên một sản phẩm khác.',
            'parsed_variants.*.sku.distinct' => 'Có mã SKU bị trùng lặp bên trong lưới biến thể đang gửi.',
            'parsed_variants.*.promotional_price.lte' => 'Giá khuyến mãi không được lớn hơn Giá bán.',
            'parsed_variants.*.image_file.required_without' => 'Vui lòng chọn ảnh cho biến thể mới thêm.',
            'parsed_variants.*.image_file.max' => 'Ảnh của biến thể không được vượt quá 15MB.',
        ];
    }
}