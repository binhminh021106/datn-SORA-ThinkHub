<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chúc mừng sinh nhật từ SORA ThinkHub!</title>
    <style>
        /* Reset cơ bản */
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 40px 0;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid #eaeaea;
        }

        /* Phần Header tối màu giống mẫu */
        .header {
            background-color: #343a40;
            color: #ffffff;
            text-align: center;
            padding: 25px 20px;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .content {
            padding: 30px 40px;
            color: #333333;
            line-height: 1.6;
            font-size: 15px;
        }

        /* Hộp thông báo nổi bật giống mẫu nhưng thay màu #9F273B */
        .alert-box {
            background-color: #fcf0f1;
            border-left: 4px solid #9F273B;
            padding: 15px 20px;
            color: #9F273B;
            font-weight: bold;
            margin-bottom: 25px;
            font-size: 16px;
        }

        .greeting {
            margin-bottom: 20px;
            color: #333333;
            text-align: justify;
        }

        /* Bảng thông tin giống form mẫu */
        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .details-table tr {
            border-bottom: 1px solid #f0f0f0;
        }

        .details-table td {
            padding: 16px 0;
        }

        .details-table .label {
            color: #666666;
            width: 35%;
            font-weight: bold;
        }

        .details-table .value {
            color: #111111;
            font-weight: bold;
        }

        .highlight-text {
            color: #9F273B !important;
            font-size: 16px;
        }

        /* Nút bấm Call-to-action */
        .btn-container {
            text-align: center;
            margin-top: 35px;
            margin-bottom: 10px;
        }

        .btn-action {
            display: inline-block;
            background-color: #9F273B;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 40px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 14px;
            text-transform: uppercase;
            transition: opacity 0.3s;
        }

        .btn-action:hover {
            opacity: 0.9;
        }

        /* Footer đơn giản */
        .footer {
            background-color: #f9fafb;
            color: #888888;
            text-align: center;
            padding: 25px 20px;
            font-size: 13px;
            border-top: 1px solid #eeeeee;
            line-height: 1.5;
        }
    </style>
</head>

<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            HỆ THỐNG SORA THINKHUB
        </div>

        <div class="content">
            <!-- Alert Box -->
            <div class="alert-box">
                ✨ QUÀ TẶNG ĐẶC QUYỀN NHÂN NGÀY SINH NHẬT!
            </div>

            <div class="greeting">
                Xin chào <strong>{{ $user->fullName }}</strong>,<br><br>
                Nhân dịp sinh nhật, SORA ThinkHub xin gửi đến bạn lời chúc một tuổi mới thật nhiều niềm vui, hạnh phúc và luôn tỏa sáng theo cách riêng c ủa mình.<br><br>
                Cảm ơn bạn đã tin tưởng đồng hành cùng chúng tôi. Như một lời tri ân, SORA xin dành tặng bạn một ưu đãi đặc biệt để ngày sinh nhật thêm trọn vẹn và ý nghĩa.
            </div>

            <!-- Bảng thông tin -->
            <table class="details-table">
                <tr>
                    <td class="label">Mã quà tặng:</td>
                    <td class="value highlight-text">{{ $coupon->code }}</td>
                </tr>
                <tr>
                    <td class="label">Mức ưu đãi:</td>
                    <td class="value highlight-text">
                        @if($coupon->type === 'percent' || $coupon->type === 'birthday')
                        {{ $coupon->value }}%
                        @else
                        {{ number_format($coupon->value, 0, ',', '.') }} đ
                        @endif
                    </td>
                </tr>
                <tr>
                    <td class="label">Áp dụng cho:</td>
                    <td class="value">Tất cả các bộ sưu tập trang sức</td>
                </tr>
                <tr>
                    <td class="label">Hạn sử dụng:</td>
                    <td class="value">{{ \Carbon\Carbon::parse($coupon->expires_at)->format('d/m/Y') }}</td>
                </tr>
            </table>

            <!-- Button -->
            <div class="btn-container">
                <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/shop?coupon={{ urlencode($coupon->code) }}" class="btn-action">CHỌN MÓN TRANG SỨC CHO RIÊNG MÌNH</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            Trân trọng,<br>
            <strong>Đội ngũ SORA ThinkHub</strong> - <em>Tôn vinh vẻ đẹp đích thực</em><br><br>
            Email này được tạo tự động từ hệ thống chăm sóc khách hàng của SORA.
        </div>
    </div>
</body>

</html>