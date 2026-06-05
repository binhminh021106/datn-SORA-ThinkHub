<?php

namespace App\Http\Requests\AdminAttendance;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class AttendanceAdjustmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'admin_id' => ['required', 'integer', 'exists:admins,id'],
            'attendance_date' => ['required', 'date', 'before_or_equal:today'],
            'work_shift_id' => ['nullable', 'integer', 'exists:work_shifts,id'],
            'clock_in' => ['nullable', 'date_format:H:i'],
            'clock_out' => ['nullable', 'date_format:H:i'],
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'admin_id.required' => 'Vui long chon nhan su can dieu chinh.',
            'admin_id.exists' => 'Nhan su can dieu chinh khong ton tai.',
            'attendance_date.required' => 'Vui long chon ngay cong.',
            'attendance_date.before_or_equal' => 'Khong the dieu chinh ngay trong tuong lai.',
            'work_shift_id.exists' => 'Ca lam viec khong ton tai.',
            'clock_in.date_format' => 'Gio vao phai co dinh dang HH:mm.',
            'clock_out.date_format' => 'Gio ra phai co dinh dang HH:mm.',
            'reason.required' => 'Vui long nhap ly do dieu chinh.',
            'reason.min' => 'Ly do dieu chinh can toi thieu 10 ky tu.',
            'reason.max' => 'Ly do dieu chinh khong duoc vuot qua 1000 ky tu.',
            'note.max' => 'Ghi chu khong duoc vuot qua 1000 ky tu.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Du lieu dieu chinh gio cong khong hop le.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
