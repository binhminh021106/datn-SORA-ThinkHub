<?php

namespace App\Http\Requests\Admin\HolidayEvent;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHolidayEventRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $mergeData = [];

        if ($this->filled('day') && $this->filled('month')) {
            $mergeData['event_date'] = str_pad((string) $this->day, 2, '0', STR_PAD_LEFT)
                . '/'
                . str_pad((string) $this->month, 2, '0', STR_PAD_LEFT);
        }

        if (!$this->has('status')) {
            $mergeData['status'] = 'active';
        }

        if ($this->has('discount_type') && is_null($this->discount_type)) {
            $mergeData['discount_type'] = 'percentage';
        }

        if ($this->has('target_audience') && is_array($this->target_audience)) {
            $mergeData['target_audience'] = implode(',', $this->target_audience);
        }

        $this->merge($mergeData);
    }

    public function rules()
    {
        return [
            'name' => 'required|string|min:2|max:255',
            'event_date' => ['required', 'string', 'max:5', 'regex:/^\d{2}\/\d{2}$/'],
            'target_audience' => 'required|string',
            'email_subject' => 'required|string|min:3|max:255',
            'email_content' => [
                'required',
                'string',
                function ($attribute, $value, $fail) {
                    $pureText = trim(strip_tags($value));
                    if (strlen($pureText) < 5) {
                        $fail('Nội dung email phải có ít nhất 5 ký tự (không tính định dạng).');
                    }
                },
            ],
            'voucher_code' => 'nullable|string|min:3|max:50',
            'discount_type' => 'nullable|in:percentage,fixed',
            'discount_value' => 'nullable|numeric|min:0',
            'min_spend' => 'nullable|numeric|min:0',
            'usage_limit_per_user' => 'nullable|integer|min:1',
            'validity_days' => 'nullable|integer|min:1',
            'status' => 'required|in:active,inactive',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Vui lòng nhập tên sự kiện.',
            'name.min' => 'Tên sự kiện phải có ít nhất 2 ký tự.',
            'event_date.required' => 'Vui lòng chọn ngày diễn ra sự kiện.',
            'event_date.regex' => 'Ngày diễn ra không hợp lệ.',
            'target_audience.required' => 'Vui lòng chọn đối tượng nhận email.',
            'email_subject.required' => 'Vui lòng nhập tiêu đề email.',
            'email_subject.min' => 'Tiêu đề email quá ngắn.',
            'email_content.required' => 'Vui lòng nhập nội dung email.',
            'voucher_code.min' => 'Mã quà tặng phải có ít nhất 3 ký tự.',
            'discount_type.in' => 'Loại giảm giá không hợp lệ.',
            'discount_value.numeric' => 'Mức giảm giá phải là một số.',
            'discount_value.min' => 'Mức giảm giá không được nhỏ hơn 0.',
        ];
    }
}
