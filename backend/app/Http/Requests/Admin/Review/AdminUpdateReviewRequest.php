<?php

namespace App\Http\Requests\Admin\Review;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Models\Review;

class AdminUpdateReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('admin_reply')) {
            $reply = trim($this->admin_reply);
            $reply = strip_tags($reply);

            $this->merge([
                'admin_reply' => $reply === '' ? null : $reply,
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'status' => [
                'sometimes',
                'required',
                'string',
                Rule::in(['pending', 'approved', 'hidden']),
            ],
            'admin_reply' => [
                'nullable',
                'string',
                'max:1500',
            ],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $newStatus = $this->input('status');
            $reply = $this->input('admin_reply');

            if ($newStatus === 'hidden' && !empty($reply)) {
                $validator->errors()->add(
                    'admin_reply',
                    'Bạn đang viết phản hồi nhưng lại để trạng thái "Ẩn". Khách hàng sẽ không thấy được phản hồi này!'
                );
            }

            if ($this->has('status')) {
                $reviewId = $this->route('review') ?? $this->route('id');

                if ($reviewId) {
                    $review = Review::find($reviewId);

                    if ($review) {
                        $oldStatus = $review->status;

                        $allowedTransitions = [
                            'pending'  => ['pending', 'approved', 'hidden'],
                            'approved' => ['approved', 'hidden'],
                            'hidden'   => ['hidden', 'approved', 'pending']
                        ];

                        if (!in_array($newStatus, $allowedTransitions[$oldStatus] ?? [])) {
                            $validator->errors()->add(
                                'status',
                                'Bạn không thể đổi trạng thái đánh giá từ "' . $this->translateStatus($oldStatus) . '" sang "' . $this->translateStatus($newStatus) . '".'
                            );
                        }
                    }
                }
            }
        });
    }


    private function translateStatus($status)
    {
        $map = [
            'pending'  => 'Chờ duyệt',
            'approved' => 'Đã duyệt',
            'hidden'   => 'Đã ẩn'
        ];
        return $map[$status] ?? $status;
    }

    public function messages(): array
    {
        return [
            'status.required'    => 'Vui lòng chọn trạng thái kiểm duyệt.',
            'status.in'          => 'Trạng thái không hợp lệ. Chỉ chấp nhận: Chờ duyệt, Đã duyệt, hoặc Đã ẩn.',
            'admin_reply.string' => 'Nội dung phản hồi không đúng định dạng.',
            'admin_reply.max'    => 'Phản hồi quá dài! Vui lòng viết ngắn gọn dưới :max ký tự.',
        ];
    }

    public function attributes(): array
    {
        return [
            'status'      => 'Trạng thái',
            'admin_reply' => 'Phản hồi của cửa hàng',
        ];
    }
}
