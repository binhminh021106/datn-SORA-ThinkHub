<?php

namespace App\Http\Requests\ShiftSwap;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreShiftSwapRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Ràng buộc góc khuất: Không thể chọn chính mình để đổi ca
        $currentUserId = $this->user()->id;

        return [
            'target_admin_id' => ['required', 'exists:admins,id', 'not_in:' . $currentUserId],
            'work_shift_id' => ['required', 'exists:work_shifts,id'],
            'date' => ['required', 'date', 'after:today'], // Chỉ được đổi ca từ ngày mai trở đi
        ];
    }

    public function messages(): array
    {
        return [
            'target_admin_id.required' => 'Vui lòng chọn nhân viên bạn muốn nhờ đổi ca.',
            'target_admin_id.exists' => 'Nhân viên được chọn không tồn tại trong hệ thống.',
            'target_admin_id.not_in' => 'Bạn không thể tự đổi ca với chính mình.',
            'work_shift_id.required' => 'Vui lòng chọn ca làm việc cần đổi.',
            'work_shift_id.exists' => 'Ca làm việc không tồn tại.',
            'date.required' => 'Vui lòng chọn ngày cần đổi ca.',
            'date.date' => 'Ngày không đúng định dạng.',
            'date.after' => 'Chỉ có thể xin đổi ca cho các ngày trong tương lai.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Dữ liệu yêu cầu đổi ca không hợp lệ.',
            'errors' => $validator->errors()
        ], 422));
    }
}