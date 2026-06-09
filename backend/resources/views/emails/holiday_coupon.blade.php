<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e4e8; border-radius: 8px; overflow: hidden; background: #fff;">
  <div style="background-color: #343a40; color: #fff; text-align: center; padding: 14px; font-weight: 700; font-size: 14px; text-transform: uppercase;">
    HỆ THỐNG SORA THINKHUB
  </div>
  <div style="padding: 20px;">
    <div style="background: linear-gradient(135deg, #9b111e 0%, #720b15 100%); color: #fff; padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 24px;">
      <span style="font-weight: bold; font-size: 16px; text-transform: uppercase;">QUÀ TẶNG {{ $eventName }}</span>
    </div>
    <div style="color: #495057; line-height: 1.6; font-size: 13px; margin-bottom: 20px;">
      {!! $emailContent !!}
    </div>

    @if($voucherCode)
    <div style="background: #fff0f3; border: 1px dashed #dc3545; padding: 16px; border-radius: 8px; margin-bottom: 10px;">
      <div style="text-align: center; margin-bottom: 12px;">
        <span style="background-color: #dc3545; color: #fff; border-radius: 50px; padding: 4px 12px; font-weight: 600; font-size: 12px;">ƯU ĐÃI ĐẶC QUYỀN</span>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="color: #6c757d; padding: 4px 0;">Mã quà tặng:</td><td style="font-weight: bold; font-size: 16px; text-align: right; color: #dc3545;">{{ $voucherCode }}</td></tr>
        <tr><td style="color: #6c757d; padding: 4px 0;">Mức ưu đãi:</td><td style="font-weight: bold; text-align: right; color: #212529;">{{ $discount }}</td></tr>
        <tr><td style="color: #6c757d; padding: 4px 0;">Áp dụng:</td><td style="text-align: right; color: #212529;">{{ $applicableScope }}</td></tr>
        <tr><td style="color: #6c757d; padding: 4px 0;">Hạn sử dụng:</td><td style="text-align: right; color: #212529;">{{ $expiresAt }}</td></tr>
      </table>
    </div>
    @endif

    <div style="text-align: center; margin-top: 24px;">
      <a href="{{ route('shop.index') }}" style="display: inline-block; background: #dc3545; color: #fff; text-decoration: none; padding: 14px 24px; font-weight: bold; border-radius: 6px; font-size: 13px; text-transform: uppercase;">
        CHỌN MÓN TRANG SỨC CHO RIÊNG MÌNH
      </a>
    </div>
  </div>
</div>
