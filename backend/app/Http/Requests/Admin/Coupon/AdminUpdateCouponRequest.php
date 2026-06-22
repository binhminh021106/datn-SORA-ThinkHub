<?php

namespace App\Http\Requests\Admin\Coupon;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminUpdateCouponRequest extends FormRequest
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
     */
    public function rules(): array
    {
        $couponId = $this->route('id');

        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'min:3',
                'max:255'
            ],
            'code' => [
                'sometimes',
                'required',
                'string',
                'min:5',
                'max:50',
                'regex:/^[A-Z0-9]+$/',
                Rule::unique('coupons', 'code')
                    ->ignore($couponId)
                    ->whereNull('deleted_at'),
            ],
            'min_spend' => [
                'sometimes',
                'required',
                'integer',
                'min:0'
            ],
            'type' => [
                'sometimes',
                'required',
                Rule::in(['fixed', 'percentage'])
            ],
            'value' => [
                'sometimes',
                'required',
                'integer',
                $this->type === 'percentage' ? 'min:1' : 'min:1000',
                $this->type === 'percentage' ? 'max:100' : '',
            ],
            'usage_limit' => [
                'sometimes',
                'required',
                'integer',
                'min:1'
            ],
            'usage_limit_per_user' => [
                'sometimes',
                'required',
                'integer',
                'min:1',
                'lte:usage_limit'
            ],
            'expires_at' => [
                'sometimes',
                'required',
                'date',
                'after:now' 
            ],
            'status' => [
                'sometimes',
                'nullable',
                Rule::in(['active', 'inactive']),
            ]
        ];
    }

    /**
     * Thông báo lỗi tiếng Việt
     */
    public function messages(): array
    {
        return [
            'required' => ':attribute không được để trống.',
            'code.unique' => 'Mã giảm giá này đã tồn tại trong hệ thống.',
            'code.regex' => 'Mã giảm giá chỉ được chứa CHỮ IN HOA và SỐ, không có khoảng trắng hay ký tự đặc biệt.',
            'type.in' => 'Loại giảm giá không hợp lệ (chỉ chấp nhận cố định hoặc phần trăm).',
            'integer' => ':attribute phải là con số.',
            'min' => ':attribute không được nhỏ hơn :min.',
            'max' => ':attribute không được lớn hơn :max.',
            'after' => ':attribute phải là một thời điểm trong tương lai.',
            'date' => ':attribute không đúng định dạng ngày tháng.',
            'usage_limit_per_user.lte' => 'Lượt dùng mỗi khách không được vượt quá tổng lượt dùng.',
        ];
    }

    /**
     * Tên các trường 
     */
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