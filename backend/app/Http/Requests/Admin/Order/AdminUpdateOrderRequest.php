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
            'status' => 'required|string|in:pending,confirmed,processing,shipping,delivered,cancelled,returned,return_requested',
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

            // 1. Không cho phép đơn Đã Hủy/Hoàn Trả quay lại trạng thái tiến trình bình thường
            if (in_array($oldStatus, ['cancelled', 'returned']) && !in_array($newStatus, ['cancelled', 'returned'])) {
                $validator->errors()->add('status', 'Đơn hàng đã Hủy hoặc Hoàn trả thì không thể chuyển lại thành trạng thái hiện tại.');
            }

            // 2. Đã Giao Thành Công thì không thể lùi lại các bước xử lý trước đó
            if ($oldStatus === 'delivered' && in_array($newStatus, ['pending', 'confirmed', 'processing', 'shipping'])) {
                $validator->errors()->add('status', 'Đơn hàng đã giao thành công chỉ có thể chuyển sang trạng thái Hoàn trả.');
            }

            // 3. Bắt buộc nhập Ghi chú khi Admin Hủy hoặc Hoàn trả đơn hàng
            if (in_array($newStatus, ['cancelled', 'returned']) && $oldStatus !== $newStatus && empty($this->note)) {
                $validator->errors()->add('note', 'Bắt buộc phải nhập Lý do (Ghi chú) khi Hủy hoặc Hoàn trả đơn hàng.');
            }

            // 4. Đơn đã thanh toán không thể lùi về Chưa thanh toán
            if ($oldPayment === 'paid' && $newPayment === 'unpaid') {
                $validator->errors()->add('payment_status', 'Đơn đã thanh toán không thể lùi về trạng thái Chưa thanh toán. Xin hãy chọn "Đã hoàn tiền".');
            }

            // 5. Phải thanh toán xong mới được phép xác nhận Hoàn tất giao hàng
            if ($newStatus === 'delivered' && $oldPayment !== 'paid' && $newPayment !== 'paid') {
                $validator->errors()->add('status', 'Phải thanh toán xong mới được chuyển trạng thái Hoàn tất.');
            }

            // 6. Cấm hoàn tiền nếu đơn hàng không bị Hủy hoặc Hoàn trả
            if ($newPayment === 'refunded' && !in_array($newStatus, ['cancelled', 'returned'])) {
                $validator->errors()->add('payment_status', 'Chỉ được phép chọn Hoàn tiền khi đơn hàng ở trạng thái Đã Hủy hoặc Hoàn Trả.');
            }

            // 7. Đơn Đã Giao thì cấm đụng vào trạng thái thanh toán (trừ trường hợp Hoàn Trả)
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