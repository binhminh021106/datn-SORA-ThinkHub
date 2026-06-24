<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AdminStoreCategoryRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'min:3', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('categories', 'slug')->whereNull('deleted_at')],
            'parent_id' => ['nullable', 'integer', 'exists:categories,id'],
            'description' => ['nullable', 'string', 'max:5000'],
            'status' => ['required', Rule::in(['active', 'hidden'])],
            'thumbnail' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:15360'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'attributes_schema' => ['nullable', 'string'], 
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Tên danh mục không được để trống.',
            'name.min' => 'Tên danh mục phải có ít nhất 3 ký tự.',
            'name.max' => 'Tên danh mục không được vượt quá 255 ký tự.',
            'slug.required' => 'Danh mục (Slug) không được để trống.',
            'slug.unique' => 'Danh mục này đã tồn tại trên hệ thống. Vui lòng chọn tên khác.',
            'parent_id.exists' => 'Danh mục cha không hợp lệ hoặc đã bị xóa.',
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