<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Đặt lại mật khẩu SORA Admin</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f7f6;
            margin: 0;
            padding: 0;
        }

        .email-container {
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .header {
            background: linear-gradient(135deg, #009981 0%, #00cba9 100%);
            color: #ffffff;
            text-align: center;
            padding: 30px 20px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
        }

        .content {
            padding: 40px 30px;
            color: #333333;
            line-height: 1.6;
        }

        .content p {
            margin-bottom: 20px;
            font-size: 16px;
        }

        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #888888;
            font-size: 13px;
            border-top: 1px solid #eeeeee;
        }

        .warning-text {
            font-size: 14px;
            color: #666666;
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 10px 15px;
            margin-top: 30px;
        }
    </style>
</head>

<body>
    <div class="email-container">
        <div class="header">
            <h1>SORA Admin System</h1>
        </div>
        <div class="content">
            <p>Xin chào <strong>{{ $admin->fullname }}</strong>,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản quản trị SORA của bạn liên kết với email
                <strong>{{ $admin->email }}</strong>.
            </p>

            <p>Vui lòng nhấp vào nút bên dưới để tiến hành đặt lại mật khẩu mới. Liên kết này sẽ hết hạn sau 60 phút để
                đảm bảo an toàn.</p>

            <div style="text-align: center; margin: 25px 0;">
                <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}/admin/reset-password?token={{ $token }}&email={{ urlencode($admin->email) }}"
                    style="display: inline-block; padding: 14px 30px; background-color: #009981; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; text-align: center; border: 1px solid #009981;">
                    <span style="color: #ffffff !important;">Đặt Lại Mật Khẩu</span>
                </a>
            </div>

            <div class="warning-text">
                <strong>Lưu ý:</strong> Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản
                của bạn vẫn an toàn và không có thay đổi nào được thực hiện.
            </div>

            <p style="margin-top: 30px;">Trân trọng,<br><strong>Đội ngũ Kỹ thuật SORA</strong></p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} SORA. Mọi quyền được bảo lưu.<br>
            Đây là email tự động, vui lòng không trả lời.
        </div>
    </div>
</body>

</html>
