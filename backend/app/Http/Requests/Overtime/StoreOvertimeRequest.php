<?php

namespace App\Http\Requests\Overtime;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Carbon\Carbon;

class StoreOvertimeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation()
    {
        $mergeData = [];
        
        foreach (['start_time', 'end_time'] as $field) {
            if ($this->has($field) && !empty($this->input($field))) {
                try {
                    $mergeData[$field] = Carbon::parse($this->input($field))->format('H:i');
                } catch (\Exception $e) {
                    // Bỏ qua để Rules bắt lỗi date_format
                }
            }
        }

        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'after_or_equal:today'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'Vui lòng chọn ngày muốn tăng ca.',
            'date.date' => 'Ngày không đúng định dạng.',
            'date.after_or_equal' => 'Không thể đăng ký tăng ca cho ngày trong quá khứ.',
            'start_time.required' => 'Vui lòng chọn giờ bắt đầu OT.',
            'start_time.date_format' => 'Giờ bắt đầu OT không đúng định dạng (HH:mm).',
            'end_time.required' => 'Vui lòng chọn giờ kết thúc OT.',
            'end_time.date_format' => 'Giờ kết thúc OT không đúng định dạng (HH:mm).',
            'reason.max' => 'Lý do tăng ca không được vượt quá 1000 ký tự.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Dữ liệu đăng ký tăng ca không hợp lệ.',
            'errors' => $validator->errors()
        ], 422));
    }
}