<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClientProfileUpdateRequest extends FormRequest
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
        return [
            'fullName' => ['required', 'string', 'min:2', 'max:50', 'regex:/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/u'],
            'phone' => ['required', 'numeric', 'regex:/^0[3|5|7|8|9][0-9]{8}$/'],
            'birthday' => ['required', 'date', 'before_or_equal:today'],
            'gender' => ['required', 'in:Nam,Nữ,Khác'],
            'avatar' => ['nullable', 'image', 'max:5120'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'fullName.required' => 'Vui lòng nhập họ và tên',
            'fullName.min' => 'Họ tên phải từ 2 đến 50 ký tự',
            'fullName.max' => 'Họ tên phải từ 2 đến 50 ký tự',
            'fullName.regex' => 'Họ tên phải chứa ít nhất 2 từ (không chứa số hoặc ký tự đặc biệt)',
            'phone.required' => 'Vui lòng nhập số điện thoại',
            'phone.numeric' => 'Số điện thoại chỉ được chứa số',
            'phone.regex' => 'Số điện thoại không hợp lệ',
            'birthday.required' => 'Vui lòng chọn ngày sinh',
            'birthday.date' => 'Ngày sinh không hợp lệ',
            'birthday.before_or_equal' => 'Ngày sinh không hợp lệ',
            'gender.required' => 'Vui lòng chọn giới tính',
            'gender.in' => 'Giới tính không hợp lệ',
            'avatar.image' => 'File avatar phải là hình ảnh.',
            'avatar.max' => 'Kích thước avatar không được vượt quá 5MB.',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($this->has('email')) {
                $validator->errors()->add('email', 'Bạn không có quyền thay đổi email');
            }

            if ($this->has('birthday') && $this->birthday) {
                try {
                    $birthday = \Carbon\Carbon::parse($this->birthday);
                    $today = \Carbon\Carbon::now();
                    $age = $birthday->diffInYears($today);
                    
                    if ($age < 13) {
                        $validator->errors()->add('birthday', 'Bạn chưa đủ tuổi sử dụng');
                    }
                } catch (\Exception $e) {
                    // Lỗi format date đã được xử lý ở rules()
                }
            }

            // Kiểm tra số điện thoại đã tồn tại chưa
            if ($this->has('phone') && $this->phone && preg_match('/^0[3|5|7|8|9][0-9]{8}$/', $this->phone)) {
                $userId = auth('sanctum')->id();
                
                // Fallback nếu guard sanctum chưa được khởi tạo (do thiếu middleware trên route)
                if (!$userId && $this->bearerToken()) {
                    $token = \Laravel\Sanctum\PersonalAccessToken::findToken($this->bearerToken());
                    if ($token) {
                        $userId = $token->tokenable_id;
                    }
                }

                \Illuminate\Support\Facades\Log::info('ClientProfileUpdateRequest - Validating phone', [
                    'phone' => $this->phone,
                    'auth_sanctum_id' => $userId,
                    'auth_header' => $this->header('Authorization')
                ]);

                $exists = \App\Models\User::where('phone', $this->phone)
                    ->when($userId, fn($q) => $q->where('id', '!=', $userId))
                    ->exists();
                
                if ($exists) {
                    $validator->errors()->add('phone', 'Số điện thoại này đã được sử dụng bởi tài khoản khác!');
                }
            }
        });
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('fullName') && $this->fullName) {
            $this->merge([
                'fullName' => preg_replace('/\s+/', ' ', trim($this->fullName))
            ]);
        }

        if ($this->has('phone') && $this->phone) {
            $this->merge([
                'phone' => $this->normalizeVietnamesePhone($this->phone)
            ]);
        }
    }

    private function normalizeVietnamesePhone(?string $phone): ?string
    {
        if (empty($phone)) return null;
        
        $phone = trim($phone);
        if (str_starts_with($phone, '+84')) {
            $phone = '0' . substr($phone, 3);
        }
        
        return $phone;
    }
}