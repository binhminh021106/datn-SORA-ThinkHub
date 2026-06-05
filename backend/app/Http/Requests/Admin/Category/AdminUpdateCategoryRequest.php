<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AdminUpdateCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        if ($this->name && !$this->slug) {
            $this->merge([
                'slug' => Str::slug($this->name)
            ]);
        }
    }

    public function rules(): array
    {
        $id = $this->route('category');
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('categories', 'slug')->ignore($id)->whereNull('deleted_at')
            ],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id', 'not_in:' . $id],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(['active', 'hidden'])],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:15360'],  // 15MB
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'attributes_schema' => ['nullable', 'string'], 
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
            'slug.required' => 'Danh mục (Slug) không được để trống.',
            'slug.unique' => 'Danh mục này đã trùng với một danh mục khác trên hệ thống.',
            'parent_id.exists' => 'Danh mục cha không hợp lệ hoặc đã bị xóa.',
            'parent_id.not_in' => 'Danh mục cha KHÔNG THỂ là chính nó (Gây lỗi vòng lặp hệ thống).',
            'status.required' => 'Vui lòng chọn trạng thái.',
            'status.in' => 'Trạng thái không hợp lệ.',
            'thumbnail.image' => 'File tải lên phải là định dạng hình ảnh.',
            'thumbnail.mimes' => 'Hình ảnh chỉ hỗ trợ: jpeg, png, jpg, webp.',
            'thumbnail.max' => 'Kích thước ảnh không được vượt quá 15MB.',
            'sort_order.integer' => 'Thứ tự ưu tiên phải là một số nguyên.',
            'sort_order.min' => 'Thứ tự ưu tiên không được là số âm.',
        ];
    }
}