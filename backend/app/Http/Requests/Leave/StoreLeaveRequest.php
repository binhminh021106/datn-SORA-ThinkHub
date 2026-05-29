<?php

namespace App\Http\Requests\Leave;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreLeaveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'start_datetime' => ['required', 'date', 'after_or_equal:today'],
            'end_datetime' => ['required', 'date', 'after_or_equal:start_datetime'],
            'reason' => ['required', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_datetime.required' => 'Vui lòng chọn thời gian bắt đầu nghỉ.',
            'start_datetime.date' => 'Thời gian bắt đầu không đúng định dạng.',
            'start_datetime.after_or_equal' => 'Không thể xin nghỉ cho ngày trong quá khứ.',
            'end_datetime.required' => 'Vui lòng chọn thời gian kết thúc nghỉ.',
            'end_datetime.date' => 'Thời gian kết thúc không đúng định dạng.',
            'end_datetime.after_or_equal' => 'Thời gian kết thúc phải lớn hơn hoặc bằng thời gian bắt đầu.',
            'reason.required' => 'Vui lòng nhập lý do xin nghỉ.',
            'reason.max' => 'Lý do xin nghỉ không được vượt quá 1000 ký tự.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Dữ liệu đơn xin nghỉ không hợp lệ.',
            'errors' => $validator->errors()
        ], 422));
    }
}