<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã OTP SORA ThinkHub</title>
    <style>
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333333;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #9f273b;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            letter-spacing: 2px;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            margin-bottom: 20px;
        }
        .otp-box {
            background-color: #fcf9f5;
            border: 2px dashed #9f273b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #9f273b;
            letter-spacing: 5px;
        }
        .warning {
            font-size: 14px;
            color: #999999;
            margin-top: 30px;
        }
        .footer {
            background-color: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #aaaaaa;
            border-top: 1px solid #eeeeee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SORA THINKHUB</h1>
        </div>
        <div class="content">
            <h2>Xin chào,</h2>
            <p>Bạn vừa yêu cầu lấy lại mật khẩu cho tài khoản SORA của mình. Vui lòng sử dụng mã OTP dưới đây để xác thực:</p>
            
            <div class="otp-box">
                <span class="otp-code">{{ $otp }}</span>
            </div>
            
            <p>Mã OTP này có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
            
            <p class="warning">Nếu bạn không yêu cầu đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} SORA ThinkHub. Tất cả quyền được bảo lưu.</p>
        </div>
    </div>
</body>
</html>
