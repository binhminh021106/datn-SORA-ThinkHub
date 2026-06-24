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

    protected function prepareForValidation()
    {
        $couponId = $this->route('id');
        if ($couponId) {
            $coupon = \App\Models\Coupon::withTrashed()->find($couponId);
            if ($coupon) {
                $merge = [];
                // Only merge type if value is present to validate value limits correctly
                if ($this->has('value') && !$this->has('type')) {
                    $merge['type'] = $coupon->type;
                }
                // Only merge usage_limit if usage_limit_per_user is present to validate lte:usage_limit rule
                if ($this->has('usage_limit_per_user') && !$this->has('usage_limit')) {
                    $merge['usage_limit'] = $coupon->usage_limit;
                }
                // Merge usage_limit_per_user if usage_limit is present so we ensure limit-per-user doesn't exceed new limit
                if ($this->has('usage_limit') && !$this->has('usage_limit_per_user')) {
                    $merge['usage_limit_per_user'] = $coupon->usage_limit_per_user;
                }
                if (!empty($merge)) {
                    $this->merge($merge);
                }
            }
        }
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
                function ($attribute, $value, $fail) use ($couponId) {
                    $type = $this->input('type') ?? \App\Models\Coupon::withTrashed()->where('id', $couponId)->value('type');
                    if ($type === 'percentage') {
                        if ($value < 1 || $value > 100) {
                            $fail('Giá trị giảm theo phần trăm phải từ 1 đến 100.');
                        }
                    } else {
                        if ($value < 1000) {
                            $fail('Giá trị giảm tiền mặt phải từ 1.000 trở lên.');
                        }
                    }
                },
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