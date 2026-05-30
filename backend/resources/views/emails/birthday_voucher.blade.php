@php
    $customerName = $user->fullName ?? $user->name ?? 'Quý khách';
    $frontendUrl = rtrim(config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:5173')), '/');
    $shopUrl = $frontendUrl . '/shop?coupon=' . urlencode($coupon->code);
    $isPercent = in_array($coupon->type, ['percentage', 'percent', 'birthday'], true);
    $discountLabel = $isPercent
        ? rtrim(rtrim(number_format((float) $coupon->value, 2, ',', '.'), '0'), ',') . '%'
        : number_format((float) $coupon->value, 0, ',', '.') . 'đ';
    $expiresAt = $coupon->expires_at ? \Carbon\Carbon::parse($coupon->expires_at)->format('d/m/Y') : 'Không giới hạn';
    $minSpend = (float) ($coupon->min_spend ?? 0);
@endphp

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Voucher sinh nhật từ SORA ThinkHub</title>
    <style>
        body { margin: 0; padding: 32px 0; background: #f5f6f8; font-family: Arial, Helvetica, sans-serif; color: #2f3437; }
        .container { width: 100%; max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e8ecef; border-radius: 8px; overflow: hidden; }
        .header { background: #212529; color: #ffffff; padding: 24px 28px; text-align: center; font-weight: 700; letter-spacing: .5px; text-transform: uppercase; }
        .content { padding: 30px 36px; line-height: 1.65; font-size: 15px; }
        .banner { background: #fcf0f1; color: #9F273B; border-left: 4px solid #9F273B; padding: 14px 18px; margin-bottom: 22px; font-weight: 700; }
        .voucher { margin: 26px 0; border: 1px dashed #9F273B; border-radius: 8px; background: #fff8f9; padding: 18px 20px; }
        .voucher-code { margin: 8px 0 14px; font-size: 28px; letter-spacing: 2px; color: #9F273B; font-weight: 800; text-align: center; }
        .details { width: 100%; border-collapse: collapse; font-size: 14px; }
        .details td { padding: 10px 0; border-top: 1px solid #f0d7db; }
        .details td:first-child { color: #6c757d; width: 42%; }
        .details td:last-child { font-weight: 700; text-align: right; }
        .cta-wrap { text-align: center; margin: 30px 0 8px; }
        .cta { display: inline-block; background: #9F273B; color: #ffffff !important; text-decoration: none; padding: 14px 30px; border-radius: 4px; font-size: 14px; font-weight: 700; text-transform: uppercase; }
        .note { color: #6c757d; font-size: 13px; margin-top: 18px; }
        .footer { background: #f8f9fa; border-top: 1px solid #edf0f2; padding: 20px 28px; text-align: center; color: #777; font-size: 13px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">SORA ThinkHub</div>

        <div class="content">
            <div class="banner">Quà tặng sinh nhật dành riêng cho bạn</div>

            <p>Xin chào <strong>{{ $customerName }}</strong>,</p>
            <p>
                Nhân dịp sinh nhật, SORA ThinkHub gửi đến bạn một voucher ưu đãi đặc biệt.
                Bấm vào nút bên dưới để sang trang shop, hệ thống sẽ ghi nhận voucher vào giỏ hàng của bạn.
            </p>

            <div class="voucher">
                <div class="voucher-code">{{ $coupon->code }}</div>
                <table class="details">
                    <tr>
                        <td>Mức ưu đãi</td>
                        <td>{{ $discountLabel }}</td>
                    </tr>
                    <tr>
                        <td>Đơn tối thiểu</td>
                        <td>{{ $minSpend > 0 ? number_format($minSpend, 0, ',', '.') . 'đ' : 'Không yêu cầu' }}</td>
                    </tr>
                    <tr>
                        <td>Lượt dùng</td>
                        <td>1 lần</td>
                    </tr>
                    <tr>
                        <td>Hạn sử dụng</td>
                        <td>{{ $expiresAt }}</td>
                    </tr>
                </table>
            </div>

            <div class="cta-wrap">
                <a href="{{ $shopUrl }}" class="cta">Nhận voucher và mua sắm</a>
            </div>

            <p class="note">
                Voucher được áp dụng tại bước thanh toán nếu tài khoản, sản phẩm và giá trị đơn hàng đáp ứng điều kiện của chương trình.
            </p>
        </div>

        <div class="footer">
            Trân trọng,<br>
            <strong>Đội ngũ SORA ThinkHub</strong>
        </div>
    </div>
</body>
</html>
