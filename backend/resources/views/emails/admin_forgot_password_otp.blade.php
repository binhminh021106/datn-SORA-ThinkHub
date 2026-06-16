<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã OTP Admin SORA ThinkHub</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f8f9fa;
            color: #212529;
            margin: 0;
            padding: 0;
            line-height: 1.5;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid #dee2e6;
        }
        .header {
            background-color: #1e293b;
            padding: 25px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 22px;
            letter-spacing: 1px;
            font-weight: 700;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .content p {
            font-size: 15px;
            color: #495057;
            margin-bottom: 20px;
        }
        .otp-box {
            background-color: #f1f5f9;
            border: 2px dashed #475569;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            display: inline-block;
            min-width: 200px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            letter-spacing: 8px;
        }
        .warning {
            font-size: 13px;
            color: #dc3545;
            margin-top: 30px;
            background-color: #f8d7da;
            padding: 10px;
            border-radius: 5px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6c757d;
            border-top: 1px solid #e9ecef;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>HỆ THỐNG QUẢN TRỊ SORA</h1>
        </div>
        <div class="content">
            <h2>Kính gửi Quản trị viên,</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản quản trị của bạn. Vui lòng sử dụng mã bảo mật dưới đây để tiếp tục:</p>
            
            <div class="otp-box">
                <span class="otp-code">{{ $otp }}</span>
            </div>
            
            <p>Mã bảo mật này có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không cung cấp mã này cho bất kỳ ai, kể cả nhân viên hỗ trợ.</p>
            
            <p class="warning">CẢNH BÁO: Nếu bạn không thực hiện yêu cầu này, có thể ai đó đang cố gắng truy cập vào tài khoản quản trị của bạn. Vui lòng kiểm tra lại ngay lập tức.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} SORA ThinkHub Admin Portal. Hệ thống lưu trữ bảo mật.</p>
        </div>
    </div>
</body>
</html>
