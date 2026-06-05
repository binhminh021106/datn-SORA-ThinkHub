<?php

namespace App\Http\Requests\Admin\Banner;

use Illuminate\Foundation\Http\FormRequest;

class AdminStoreBannerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title'         => 'required|string|max:255',
            'brand_id'      => 'nullable|exists:brands,id',
            'position'      => 'nullable|string|max:50',
            'target_url'    => 'nullable|url|max:500', 
            'start_date'    => 'nullable|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
            'status'        => 'required|in:active,hidden',
            'image_desktop' => 'required|image|mimes:jpeg,png,jpg,webp|max:10000',
            'image_mobile'  => 'required|image|mimes:jpeg,png,jpg,webp|max:10000',
        ];
    }

    public function messages()
    {
        return [
            'title.required'         => 'Tên chiến dịch banner không được để trống.',
            'image_desktop.required' => 'Vui lòng chọn ảnh cho màn hình Desktop.',
            'image_mobile.required'  => 'Vui lòng chọn ảnh cho màn hình Mobile.',
            'image_desktop.max'      => 'Ảnh Desktop không được vượt quá 10MB.',
            'image_mobile.max'       => 'Ảnh Mobile không được vượt quá 10MB.',
            'end_date.after_or_equal'=> 'Ngày kết thúc phải diễn ra sau hoặc cùng ngày bắt đầu.',
            'target_url.url'         => 'Đường dẫn đích phải là một URL hợp lệ (VD: https://...).'
        ];
    }
}