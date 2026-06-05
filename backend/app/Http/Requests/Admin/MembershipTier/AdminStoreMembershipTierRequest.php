<?php

namespace App\Http\Requests\Admin\MembershipTier;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AdminStoreMembershipTierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; 
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|min:2|max:50|unique:membership_tiers,name',
            'min_spent' => 'required|numeric|min:0|max:99999999999', // Giới hạn 99 tỷ
            'min_orders' => 'required|integer|min:0|max:1000000', // Giới hạn 1 triệu đơn
            'discount_percent' => 'required|numeric|min:0|max:100',
            'yearly_discount_quota' => 'required|integer|min:0|max:100000', // Giới hạn 100k lượt
            'yearly_service_quota' => 'required|integer|min:0|max:10000', // Giới hạn 10k lượt
            'icon' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên hạng thành viên.',
            'name.min' => 'Tên hạng phải có ít nhất 2 ký tự.',
            'name.max' => 'Tên hạng không được vượt quá 50 ký tự.',
            'name.unique' => 'Tên hạng này đã tồn tại trên hệ thống.',

            'min_spent.required' => 'Vui lòng nhập mức chi tiêu tối thiểu.',
            'min_spent.numeric' => 'Mức chi tiêu phải là một số hợp lệ.',
            'min_spent.min' => 'Mức chi tiêu không được là số âm.',
            'min_spent.max' => 'Mức chi tiêu tối thiểu quá lớn, vượt quá giới hạn hệ thống.',

            'min_orders.required' => 'Vui lòng nhập số đơn tối thiểu.',
            'min_orders.integer' => 'Số đơn tối thiểu phải là số nguyên.',
            'min_orders.min' => 'Số đơn tối thiểu không được là số âm.',
            'min_orders.max' => 'Số đơn tối thiểu không được vượt quá 1,000,000 đơn.',

            'discount_percent.required' => 'Vui lòng nhập phần trăm giảm giá.',
            'discount_percent.numeric' => 'Phần trăm giảm giá phải là một số.',
            'discount_percent.min' => 'Phần trăm giảm giá không được nhỏ hơn 0.',
            'discount_percent.max' => 'Phần trăm giảm giá không được vượt quá 100.',

            'yearly_discount_quota.required' => 'Vui lòng nhập số lượt giảm giá tối đa trong năm.',
            'yearly_discount_quota.integer' => 'Số lượt giảm giá phải là số nguyên.',
            'yearly_discount_quota.min' => 'Số lượt giảm giá không được là số âm.',
            'yearly_discount_quota.max' => 'Số lượt giảm giá quá lớn, hệ thống không hỗ trợ.',

            'yearly_service_quota.required' => 'Vui lòng nhập số lần vệ sinh/đánh bóng miễn phí.',
            'yearly_service_quota.integer' => 'Số lần dịch vụ phải là số nguyên.',
            'yearly_service_quota.min' => 'Số lần dịch vụ không được là số âm.',
            'yearly_service_quota.max' => 'Số lần dịch vụ quá lớn, hệ thống không hỗ trợ.',

            'icon.image' => 'File tải lên phải là hình ảnh.',
            'icon.mimes' => 'Hình ảnh phải có định dạng: jpeg, png, jpg, hoặc webp.',
            'icon.max' => 'Kích thước hình ảnh không được vượt quá 2MB.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'status' => 'error',
            'message' => $validator->errors()->first()
        ], 422));
    }
}