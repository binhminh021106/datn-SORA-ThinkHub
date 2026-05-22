<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Chúc mừng sinh nhật!</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background-color: #ff6b6b;
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px;
            color: #333333;
            line-height: 1.6;
        }
        .content h2 {
            color: #ff6b6b;
            font-size: 22px;
            margin-top: 0;
        }
        .voucher-box {
            background-color: #fff0f0;
            border: 2px dashed #ff6b6b;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
        }
        .voucher-code {
            font-size: 28px;
            font-weight: bold;
            color: #e74c3c;
            letter-spacing: 3px;
            margin: 10px 0;
            padding: 10px;
            background-color: #ffffff;
            display: inline-block;
            border-radius: 4px;
            border: 1px solid #ffdcdc;
        }
        .btn-shop {
            display: inline-block;
            background-color: #ff6b6b;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 25px;
            font-weight: bold;
            margin-top: 15px;
            text-transform: uppercase;
        }
        .footer {
            background-color: #333333;
            color: #ffffff;
            text-align: center;
            padding: 20px;
            font-size: 14px;
        }
        .footer p {
            margin: 5px 0;
        }
        .discount-value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 CHÚC MỪNG SINH NHẬT! 🎂</h1>
        </div>
        <div class="content">
            <h2>Chào {{ $user->fullName }},</h2>
            <p>Nhân ngày đặc biệt của bạn, SORA ThinkHub xin gửi đến bạn những lời chúc tốt đẹp nhất. Chúc bạn một tuổi mới ngập tràn niềm vui, sức khỏe và thành công!</p>
            <p>Để thêm phần trọn vẹn, chúng tôi dành tặng bạn một món quà sinh nhật đặc biệt:</p>
            
            <div class="voucher-box">
                <p>MÃ GIẢM GIÁ ĐẶC QUYỀN:</p>
                <div class="voucher-code">{{ $coupon->code }}</div>
                <p class="discount-value">
                    Giảm ngay 
                    @if($coupon->type === 'percent' || $coupon->type === 'birthday')
                        {{ $coupon->value }}%
                    @else
                        {{ number_format($coupon->value, 0, ',', '.') }}đ
                    @endif
                </p>
                <p>Hạn sử dụng: {{ \Carbon\Carbon::parse($coupon->expires_at)->format('d/m/Y') }}</p>
            </div>
            
            <p>Hãy nhanh tay sử dụng mã giảm giá này để tự thưởng cho mình những món quà tuyệt vời nhất tại SORA ThinkHub.</p>
            
            <div style="text-align: center;">
                <a href="{{ config('app.frontend_url', 'http://localhost:5173') }}/shop?coupon={{ urlencode($coupon->code) }}" class="btn-shop">Mua Sắm Ngay</a>
            </div>
        </div>
        <div class="footer">
            <p>Cảm ơn bạn đã luôn đồng hành cùng SORA ThinkHub!</p>
            <p>&copy; {{ date('Y') }} SORA ThinkHub. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
