<?php

namespace App\Http\Requests\Admin\Combo;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreComboRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->has('items_data')) {
            $this->merge(['parsed_items' => json_decode($this->input('items_data'), true) ?? []]);
        }
        
        // Convert checkbox to boolean
        if ($this->has('is_discount_stackable')) {
            $this->merge(['is_discount_stackable' => filter_var($this->input('is_discount_stackable'), FILTER_VALIDATE_BOOLEAN)]);
        }
    }

    public function rules(): array
    {
        return [
            'name'                  => 'required|string|min:3|max:255',
            'slug'                  => 'required|string|unique:combos,slug|max:255',
            'description'           => 'nullable|string',
            'thumbnail_image'       => 'required|image|mimes:jpeg,png,jpg,webp|max:5120', // Max 5MB
            'target_gender'         => 'required|in:male,female,unisex,couple',
            'target_age_group'      => 'nullable|string|max:100',
            'theme'                 => 'nullable|string|max:255',
            'discount_type'         => 'required|in:percentage,fixed_amount',
            'discount_value'        => 'required|numeric|' . ($this->input('discount_type') === 'percentage' ? 'min:1|max:100' : 'min:1000'),
            'is_discount_stackable' => 'required|boolean',
            'usage_limit'           => 'nullable|integer|min:1',
            'start_date'            => 'nullable|date',
            'end_date'              => 'nullable|date|after_or_equal:start_date',
            'status'                => 'required|in:active,hidden',
            
            'parsed_items'                      => 'required|array|min:2',
            'parsed_items.*.product_id'         => 'required|exists:products,id',
            'parsed_items.*.product_variant_id' => 'nullable|exists:product_variants,id',
            'parsed_items.*.quantity'           => 'required|integer|min:1',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'                  => 'Vui lòng nhập tên Combo.',
            'name.min'                       => 'Tên Combo phải có ít nhất 3 ký tự.',
            'slug.unique'                    => 'Combo (Slug) này đã tồn tại, vui lòng chọn tên khác.',
            'thumbnail_image.required'       => 'Vui lòng tải lên ảnh đại diện cho Combo.',
            'thumbnail_image.image'          => 'Tệp tải lên phải là định dạng hình ảnh.',
            'thumbnail_image.max'            => 'Kích thước ảnh không được vượt quá 5MB.',
            'discount_value.max'             => 'Mức giảm giá theo phần trăm không được vượt quá 100%.',
            'discount_value.min'             => 'Mức giảm giá không được là số âm.',
            'end_date.after_or_equal'        => 'Ngày kết thúc phải diễn ra sau hoặc cùng ngày với ngày bắt đầu.',
            'usage_limit.min'                => 'Giới hạn số lượt mua phải lớn hơn 0.',
            'parsed_items.min'               => 'Một Combo phải chứa tối thiểu 2 sản phẩm.',
            'parsed_items.*.product_id.required' => 'Có mặt hàng chưa được chọn sản phẩm gốc.',
            'parsed_items.*.quantity.min'    => 'Số lượng mỗi sản phẩm trong Combo phải từ 1 trở lên.',
        ];
    }
}