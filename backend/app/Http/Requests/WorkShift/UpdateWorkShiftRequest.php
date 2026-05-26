<?php

namespace App\Http\Requests\WorkShift;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Carbon\Carbon;

class UpdateWorkShiftRequest extends FormRequest
{
    public function authorize()
    {
        return true; 
    }

    protected function prepareForValidation()
    {
        $mergeData = [];
        
        if ($this->has('is_overnight')) {
            $mergeData['is_overnight'] = filter_var($this->is_overnight, FILTER_VALIDATE_BOOLEAN);
        }

        foreach (['start_time', 'end_time'] as $field) {
            if ($this->has($field) && !empty($this->$field)) {
                try {
                    $mergeData[$field] = Carbon::parse($this->$field)->format('H:i');
                } catch (\Exception $e) {}
            }
        }

        if ($this->has('working_days') && is_string($this->working_days)) {
            $mergeData['working_days'] = json_decode($this->working_days, true);
        }

        if ($this->has('overtime_days') && is_string($this->overtime_days)) {
            $mergeData['overtime_days'] = json_decode($this->overtime_days, true);
        }

        if (!empty($mergeData)) {
            $this->merge($mergeData);
        }
    }

    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'late_tolerance' => 'nullable|integer|min:0',
            'is_overnight' => 'boolean',
            'working_days' => 'required|array|size:7',
            'working_days.*' => 'boolean',
            'overtime_days' => 'required|array|size:7',
            'overtime_days.*' => 'boolean'
        ];

        if (!$this->is_overnight) {
            $rules['end_time'] .= '|after:start_time';
        }

        return $rules;
    }

    public function messages()
    {
        return [
            'name.required' => 'Vui lòng nhập tên ca làm việc.',
            'start_time.required' => 'Vui lòng chọn giờ bắt đầu.',
            'end_time.required' => 'Vui lòng chọn giờ kết thúc.',
            'end_time.after' => 'Giờ kết thúc phải lớn hơn giờ bắt đầu! Tick "Qua đêm" nếu làm xuyên đêm.',
            'working_days.required' => 'Vui lòng chọn ngày làm việc trong tuần cho ca này.',
            'working_days.size' => 'Cấu hình ngày làm việc bị lỗi định dạng.',
            'overtime_days.required' => 'Vui lòng chọn ngày tăng ca cho ca này.',
            'overtime_days.size' => 'Cấu hình ngày tăng ca bị lỗi định dạng.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors()
        ], 422));
    }
}