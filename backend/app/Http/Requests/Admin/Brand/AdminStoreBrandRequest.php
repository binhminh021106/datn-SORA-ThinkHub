<?php

namespace App\Http\Requests\Admin\Brand;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreBrandRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'name'        => 'required|string|min:3|max:255|unique:brands,name,NULL,id,deleted_at,NULL',
            'slug'        => 'required|string|max:255|unique:brands,slug,NULL,id,deleted_at,NULL',
            'logo'        => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:15360', //15mb
            'description' => 'nullable|string|max:5000',
            'status'      => 'required|in:active,hidden', 
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'    => 'Tên thương hiệu không được để trống.',
            'name.min'         => 'Tên thương hiệu phải có ít nhất 3 ký tự.',
            'name.max'         => 'Tên thương hiệu không được vượt quá 255 ký tự.',
            'slug.required'    => 'Thương hiệu (slug) không được để trống.',
            'name.unique'      => 'Thương hiệu (name/slug) này đã tồn tại, vui lòng chọn tên khác.',
            'logo.image'       => 'File tải lên phải là hình ảnh.',
            'logo.mimes'       => 'Định dạng ảnh không hợp lệ (Chỉ hỗ trợ jpeg, png, jpg, webp, svg).',
            'logo.max'         => 'Kích thước logo không được vượt quá 15MB.',
            'status.required'  => 'Trạng thái không được để trống.',
            'status.in'        => 'Trạng thái không hợp lệ.',
        ];
    }
}