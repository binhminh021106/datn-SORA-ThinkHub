<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\Order;

class AdminUpdateOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|string|in:pending,confirmed,processing,shipping,delivered,cancelled,returned,return_requested,return_negotiating,return_retrieving',
            'payment_status' => 'required|string|in:unpaid,paid,refunded',
            'note'           => 'nullable|string|max:1000',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $orderId = $this->route('id') ?? $this->route('order');
            $order = Order::find($orderId);

            if (!$order) {
                $validator->errors()->add('status', 'Không tìm thấy đơn hàng trên hệ thống.');
                return;
            }

            $oldStatus = $order->status;
            $newStatus = $this->status;

            $oldPayment = $order->payment_status;
            $newPayment = $this->payment_status;

            if (in_array($oldStatus, ['cancelled', 'returned']) && !in_array($newStatus, ['cancelled', 'returned'])) {
                $validator->errors()->add('status', 'Đơn hàng đã Hủy hoặc Hoàn trả thì không thể chuyển lại thành trạng thái hiện tại.');
            }

            if ($oldStatus === 'delivered' && in_array($newStatus, ['pending', 'confirmed', 'processing', 'shipping'])) {
                $validator->errors()->add('status', 'Đơn hàng đã giao thành công chỉ có thể chuyển sang trạng thái Hoàn trả.');
            }

            if (in_array($newStatus, ['cancelled', 'returned']) && $oldStatus !== $newStatus && empty($this->note)) {
                $validator->errors()->add('note', 'Bắt buộc phải nhập Lý do (Ghi chú) khi Hủy hoặc Hoàn trả đơn hàng.');
            }

            if ($oldPayment === 'paid' && $newPayment === 'unpaid') {
                $validator->errors()->add('payment_status', 'Đơn đã thanh toán không thể lùi về trạng thái Chưa thanh toán. Xin hãy chọn "Đã hoàn tiền".');
            }

            if ($newStatus === 'delivered' && $oldPayment !== 'paid' && $newPayment !== 'paid') {
                if (strtoupper($order->payment_method) !== 'COD') {
                    $validator->errors()->add('status', 'Phải thanh toán xong mới được chuyển trạng thái Hoàn tất.');
                }
            }

            if ($newPayment === 'refunded' && !in_array($newStatus, ['cancelled', 'returned'])) {
                $validator->errors()->add('payment_status', 'Chỉ được phép chọn Hoàn tiền khi đơn hàng ở trạng thái Đã Hủy hoặc Hoàn Trả.');
            }
            if ($oldStatus === 'delivered' && $oldPayment !== $newPayment && $newStatus !== 'returned') {
                $validator->errors()->add('payment_status', 'Đơn hàng đã giao thành công nên không thể sửa Thanh toán.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'status.required'         => 'Vui lòng chọn trạng thái đơn hàng.',
            'status.in'               => 'Trạng thái đơn hàng không hợp lệ.',
            'payment_status.required' => 'Vui lòng chọn trạng thái thanh toán.',
            'payment_status.in'       => 'Trạng thái thanh toán không hợp lệ.',
        ];
    }
}