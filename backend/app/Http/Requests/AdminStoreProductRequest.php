<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreProductRequest extends FormRequest
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
                $variant['row_index'] = $index + 1;
            }
            
            $this->merge(['parsed_variants' => $variants]);
        }
    }

    public function rules(): array
    {
        return [
            'category_id'       => 'required|exists:categories,id',
            'brand_id'          => 'nullable|exists:brands,id',
            'name'              => 'required|string|max:255',
            'slug'              => 'required|string|unique:products,slug|max:255',
            'base_price'        => 'required|numeric|min:0',
            'thumbnail_image'   => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', 
            'status'            => 'required|in:published,draft,hidden',
            'affiliate_commission_rate' => 'nullable|numeric|min:0|max:100',
            'parsed_variants'   => 'required|array|min:1',
            
            'parsed_variants.*.sku'               => 'required|string|distinct|unique:product_variants,sku',
            'parsed_variants.*.price'             => 'required|numeric|min:0',
            'parsed_variants.*.promotional_price' => 'nullable|numeric|min:0|lte:parsed_variants.*.price', // Giá KM <= Giá gốc
            'parsed_variants.*.stock_quantity'    => 'required|integer|min:0',
            'parsed_variants.*.image_file'        => 'required|image|mimes:jpeg,png,jpg,webp|max:2048', // BẮT BUỘC PHẢI CÓ ẢNH
        ];
    }

    public function messages(): array
    {
        return [
            'category_id.required' => 'Vui lòng chọn danh mục sản phẩm.',
            'name.required' => 'Tên sản phẩm không được để trống.',
            'slug.unique' => 'Sản phẩm (slug) này đã tồn tại, vui lòng chọn tên khác.',
            'thumbnail_image.required' => 'Vui lòng tải lên ảnh đại diện chính của sản phẩm.',
            'thumbnail_image.max' => 'Ảnh đại diện chính vượt quá 15MB.',
            'affiliate_commission_rate.min' => 'Tỷ lệ hoa hồng không được nhỏ hơn 0.',
            'affiliate_commission_rate.max' => 'Tỷ lệ hoa hồng không được lớn hơn 100.',
            'parsed_variants.required' => 'Sản phẩm phải có ít nhất 1 biến thể.',
            
            'parsed_variants.*.sku.required' => 'Mã SKU của biến thể không được để trống.',
            'parsed_variants.*.sku.distinct' => 'Mã SKU bị trùng lặp ngay trong danh sách gửi lên.',
            'parsed_variants.*.sku.unique'   => 'Có mã SKU đã tồn tại trên hệ thống, vui lòng nhập mã khác.',
            'parsed_variants.*.price.required' => 'Giá bán của biến thể không được để trống.',
            'parsed_variants.*.promotional_price.lte' => 'Giá khuyến mãi của biến thể không được lớn hơn Giá bán.',
            'parsed_variants.*.stock_quantity.min' => 'Tồn kho không được là số âm.',
            'parsed_variants.*.image_file.required' => 'Có biến thể chưa được chọn ảnh (Bắt buộc phải có).',
            'parsed_variants.*.image_file.image' => 'File tải lên cho biến thể không phải là hình ảnh.',
            'parsed_variants.*.image_file.max' => 'Ảnh của biến thể vượt quá giới hạn 15MB.',
        ];
    }
}