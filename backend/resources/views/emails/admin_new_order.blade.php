<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #333; line-height: 1.6; }
        .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #dee2e6; overflow: hidden; }
        
        .header { background-color: #343a40; text-align: center; padding: 20px; color: #fff; }
        .header h2 { margin: 0; font-size: 20px; letter-spacing: 1px; }
        
        .body { padding: 30px; }
        .alert-box { background-color: #e6f9f0; border-left: 4px solid #009981; padding: 15px; margin-bottom: 25px; border-radius: 4px; }
        .alert-box p { margin: 0; color: #007a67; font-weight: bold; font-size: 16px; }

        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .info-table th { text-align: left; padding: 10px; border-bottom: 1px solid #eee; color: #6c757d; width: 40%; font-size: 14px; }
        .info-table td { padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; font-size: 14px; }
        
        .btn-wrapper { text-align: center; margin-top: 30px; }
        .btn { display: inline-block; padding: 12px 30px; background-color: #009981; color: #ffffff !important; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 14px; }
        
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #888; background-color: #f8f9fa; border-top: 1px solid #eee; }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h2>HỆ THỐNG QUẢN TRỊ SORA</h2>
        </div>
        
        <div class="body">
            <div class="alert-box">
                <p>🔔 CÓ ĐƠN ĐẶT HÀNG MỚI!</p>
            </div>
            
            <p>Xin chào Admin,</p>
            <p>Hệ thống vừa ghi nhận một đơn hàng mới từ khách hàng. Vui lòng kiểm tra và xử lý:</p>
            
            <table class="info-table">
                <tr>
                    <th>Mã đơn hàng:</th>
                    <td style="color: #9f273b; font-family: monospace; font-size: 16px;">{{ $order->order_code }}</td>
                </tr>
                <tr>
                    <th>Khách hàng:</th>
                    <td>{{ $order->customer_name }}</td>
                </tr>
                <tr>
                    <th>Số điện thoại:</th>
                    <td>{{ $order->customer_phone }}</td>
                </tr>
                <tr>
                    <th>Tổng thanh toán:</th>
                    <td style="color: #28a745; font-size: 16px;">{{ number_format($order->total_amount, 0, ',', '.') }} đ</td>
                </tr>
                <tr>
                    <th>Thanh toán:</th>
                    <td>
                        {{ $order->payment_method === 'cod' ? 'COD' : strtoupper($order->payment_method) }} 
                        ({{ $order->payment_status === 'paid' ? 'Đã thu tiền' : 'Chưa thu tiền' }})
                    </td>
                </tr>
            </table>

            <div class="btn-wrapper">
                <!-- Thay đổi Port nếu Frontend Admin của bạn chạy Port khác -->
                <a href="{{ rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/') }}/admin/orders" class="btn">Vào trang quản trị xử lý ngay</a>
            </div>
        </div>
        
        <div class="footer">
            <p>Email này được tạo tự động từ hệ thống SORA Boutique.</p>
        </div>
    </div>
</body>
</html>