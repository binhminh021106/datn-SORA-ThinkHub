<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ClientAddressUpdateRequest extends FormRequest
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
            'customer_name' => ['required', 'string', 'min:2', 'max:50', 'regex:/^[A-Za-zÀ-ỹ]+(?:\s+[A-Za-zÀ-ỹ]+)+$/u'],
            'customer_phone' => ['required', 'numeric', 'regex:/^0[3|5|7|8|9][0-9]{8}$/'],
            'city' => 'required|string|max:100',
            'district' => 'required|string|max:100',
            'ward' => 'required|string|max:100',
            'shipping_address' => 'required|string|min:10|max:255',
            'is_default' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer_name.required' => 'Vui lòng nhập tên người nhận',
            'customer_name.min' => 'Tên người nhận phải từ 2 đến 50 ký tự',
            'customer_name.max' => 'Tên người nhận phải từ 2 đến 50 ký tự',
            'customer_name.regex' => 'Tên người nhận phải chứa ít nhất 2 từ (không chứa số hoặc ký tự đặc biệt)',
            'customer_phone.required' => 'Vui lòng nhập số điện thoại',
            'customer_phone.numeric' => 'Số điện thoại chỉ được chứa số',
            'customer_phone.regex' => 'Số điện thoại không hợp lệ',
            'city.required' => 'Vui lòng chọn tỉnh/thành phố.',
            'district.required' => 'Vui lòng chọn quận/huyện.',
            'ward.required' => 'Vui lòng chọn phường/xã.',
            'shipping_address.required' => 'Vui lòng nhập địa chỉ chi tiết.',
            'shipping_address.min' => 'Địa chỉ quá ngắn',
            'shipping_address.max' => 'Địa chỉ tối đa 255 ký tự',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Có thể thêm validation nâng cao ở đây nếu cần
        });
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('customer_name') && $this->customer_name) {
            $this->merge([
                'customer_name' => preg_replace('/\s+/', ' ', trim($this->customer_name))
            ]);
        }

        if ($this->has('customer_phone') && $this->customer_phone) {
            $this->merge([
                'customer_phone' => $this->normalizeVietnamesePhone($this->customer_phone)
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