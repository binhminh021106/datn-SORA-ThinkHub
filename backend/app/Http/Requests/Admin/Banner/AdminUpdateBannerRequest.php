<?php

namespace App\Http\Requests\Admin\Banner;

use Illuminate\Foundation\Http\FormRequest;

class AdminUpdateBannerRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title'         => 'required|string|min:3|max:255',
            'brand_id'      => 'nullable|exists:brands,id',
            'position'      => 'nullable|string|max:50',
            'target_url'    => 'nullable|url|max:500',
            'start_date'    => 'nullable|date',
            'end_date'      => 'nullable|date|after_or_equal:start_date',
            'status'        => 'required|in:active,hidden',
            'image_desktop' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'image_mobile'  => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
            'video_url'     => 'nullable|mimes:mp4,webm|max:51200',
        ];
    }

    public function messages()
    {
        return [
            'title.required'         => 'Tên chiến dịch banner không được để trống.',
            'title.min'              => 'Tên chiến dịch banner phải có ít nhất 3 ký tự.',
            'image_desktop.max'      => 'Ảnh Desktop không được vượt quá 15MB.',
            'image_mobile.max'       => 'Ảnh Mobile không được vượt quá 15MB.',
            'end_date.after_or_equal'=> 'Ngày kết thúc phải diễn ra sau hoặc cùng ngày bắt đầu.',
            'target_url.url'         => 'Đường dẫn đích phải là một URL hợp lệ (VD: https://...).'
        ];
    }
}