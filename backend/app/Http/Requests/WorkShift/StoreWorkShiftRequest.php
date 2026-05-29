<?php

namespace App\Http\Requests\WorkShift;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class StoreWorkShiftRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    protected function prepareForValidation()
    {
        $mergeData = [];
        
        // Ép kiểu boolean chính xác từ FormData (string "true"/"false")
        if ($this->has('is_overnight')) {
            $mergeData['is_overnight'] = filter_var($this->input('is_overnight'), FILTER_VALIDATE_BOOLEAN);
        }

        if ($this->has('is_active')) {
            $mergeData['is_active'] = filter_var($this->input('is_active'), FILTER_VALIDATE_BOOLEAN);
        }

        // Chuẩn hóa thời gian sang định dạng H:i
        foreach (['start_time', 'end_time'] as $field) {
            if ($this->has($field) && !empty($this->input($field))) {
                try {
                    $mergeData[$field] = Carbon::parse($this->input($field))->format('H:i');
                } catch (\Exception $e) {
                    // Nếu lỗi parse, để nguyên cho Validation Rules bắt lỗi date_format
                }
            }
        }

        // Giải mã JSON nếu Frontend gửi mảng dưới dạng chuỗi
        if ($this->has('working_days') && is_string($this->input('working_days'))) {
            $decoded = json_decode($this->input('working_days'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $mergeData['working_days'] = $decoded;
            }
        }

        if ($this->has('overtime_days') && is_string($this->input('overtime_days'))) {
            $decoded = json_decode($this->input('overtime_days'), true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $mergeData['overtime_days'] = $decoded;
            }
        }

        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
    }

    public function rules(): array
    {
        $rules = [
            'name' => [
                'required', 
                'string', 
                'max:255', 
                Rule::unique('work_shifts', 'name')->whereNull('deleted_at')
            ],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'late_tolerance' => ['nullable', 'integer', 'min:0', 'max:1440'],
            'is_overnight' => ['boolean'],
            'is_active' => ['boolean'],
            'working_days' => ['required', 'array', 'size:7'],
            'working_days.*' => ['boolean'],
            'overtime_days' => ['required', 'array', 'size:7'],
            'overtime_days.*' => ['boolean']
        ];

        // Ràng buộc thời gian kết thúc phải sau thời gian bắt đầu nếu KHÔNG qua đêm
        if (!$this->input('is_overnight', false)) {
            $rules['end_time'][] = 'after:start_time';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Vui lòng nhập tên ca làm việc.',
            'name.unique' => 'Tên ca làm việc này đã tồn tại.',
            'start_time.required' => 'Vui lòng chọn giờ bắt đầu.',
            'start_time.date_format' => 'Giờ bắt đầu không đúng định dạng (HH:mm).',
            'end_time.required' => 'Vui lòng chọn giờ kết thúc.',
            'end_time.date_format' => 'Giờ kết thúc không đúng định dạng (HH:mm).',
            'end_time.after' => 'Giờ kết thúc phải lớn hơn giờ bắt đầu! Vui lòng chọn "Qua đêm" nếu làm xuyên đêm.',
            'late_tolerance.integer' => 'Số phút đi trễ phải là số.',
            'late_tolerance.min' => 'Số phút đi trễ không được âm.',
            'working_days.required' => 'Vui lòng chọn lịch làm việc trong tuần.',
            'working_days.size' => 'Cấu hình ngày làm việc phải bao gồm chính xác 7 ngày.',
            'overtime_days.required' => 'Vui lòng cấu hình ngày tăng ca.',
            'overtime_days.size' => 'Cấu hình ngày tăng ca phải bao gồm chính xác 7 ngày.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        // Trả về JSON chuẩn để TanStack Query / Axios dễ dàng catch lỗi
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Dữ liệu đầu vào không hợp lệ.',
            'errors' => $validator->errors()
        ], 422));
    }
}