<?php

namespace App\Http\Requests\Admin\Coupon;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminStoreCouponRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255'
            ],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('coupons', 'code')->whereNull('deleted_at'),
            ],
            'min_spend' => [
                'required',
                'integer',
                'min:1'
            ],
            'type' => [
                'required',
                Rule::in(['fixed', 'percentage'])
            ],
            'value' => [
                'required',
                'integer',
                'min:1',
                $this->type === 'percentage' ? 'max:100' : '',
            ],
            'usage_limit' => [
                'required',
                'integer',
                'min:1'
            ],
            'usage_limit_per_user' => [
                'required',
                'integer',
                'min:1'
            ],
            'expires_at' => [
                'required',
                'date',
                'after:now'
            ],
            'status' => [
                'nullable',
                Rule::in(['active', 'inactive']),
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'required' => ':attribute không được để trống.',
            'code.unique' => 'Mã giảm giá này đã tồn tại trong hệ thống.',
            'type.in' => 'Loại giảm giá không hợp lệ (chỉ chấp nhận cố định hoặc phần trăm).',
            'integer' => ':attribute phải là con số.',
            'min' => ':attribute không được nhỏ hơn :min.',
            'max' => ':attribute không được lớn hơn :max.',
            'after' => ':attribute phải là một thời điểm trong tương lai.',
            'date' => ':attribute không đúng định dạng ngày tháng.',
        ];
    }

    public function attributes(): array
    {
        return [
            'name' => 'Tên chương trình giảm giá',
            'code' => 'Mã giảm giá',
            'min_spend' => 'Mức chi tiêu tối thiểu',
            'type' => 'Loại giảm giá',
            'value' => 'Giá trị giảm',
            'usage_limit' => 'Tổng lượt sử dụng',
            'usage_limit_per_user' => 'Lượt dùng mỗi khách hàng',
            'expires_at' => 'Ngày hết hạn',
            'status' => 'Trạng thái',
        ];
    }
}
