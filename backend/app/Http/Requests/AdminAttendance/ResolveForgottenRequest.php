<?php

namespace App\Http\Requests\AdminAttendance;

use Illuminate\Foundation\Http\FormRequest;

class ResolveForgottenRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'note' => 'required|string|min:10|max:1000',
        ];
    }

    public function messages(): array
    {
        return [
            'note.required' => 'Bạn phải nhập lý do/giải trình cho việc quên Checkout.',
            'note.string'   => 'Lý do phải là một chuỗi văn bản.',
            'note.min'      => 'Lý do giải trình quá ngắn, vui lòng nhập ít nhất 10 ký tự.',
            'note.max'      => 'Lý do giải trình không được vượt quá 1000 ký tự.',
        ];
    }
}