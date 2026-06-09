<?php

namespace App\Mail;

use App\Models\Coupon;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class HolidayCouponMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $event;
    public $holidayName;
    public $eventName;
    public $emailContent;
    public $voucherCode;
    public $discount;
    public $expiresAt;
    public $applicableScope;

    public function __construct($user, $event, $holidayName = null)
    {
        $this->user = $user;
        $this->event = $event;
        $this->holidayName = $holidayName ?: ($event->name ?? 'su kien SORA');
        $this->eventName = $this->holidayName;
        $this->voucherCode = $event->voucher_code ?? ($event->code ?? null);

        $coupon = $this->resolveCoupon($event);

        $this->emailContent = $this->prepareEmailContent($event->email_content ?? '');
        $this->discount = $this->resolveDiscountLabel($coupon);
        $this->expiresAt = $this->resolveExpiresAtLabel($coupon);
        $this->applicableScope = $this->resolveApplicableScopeLabel($coupon);
    }

    public function build()
    {
        $subject = $this->event->email_subject
            ?? "SORA ThinkHub - Uu dai dac biet dip {$this->holidayName}";

        return $this->subject($subject)
            ->view('emails.holiday_coupon');
    }

    private function prepareEmailContent(?string $content): string
    {
        $name = $this->user->fullName ?? $this->user->name ?? 'Quy khach';

        $content = str_replace(
            ['[Ten_Khach_Hang]', '[Tên_Khách_Hàng]', '[TÃªn_KhÃ¡ch_HÃ ng]', '[TÃƒÂªn_KhÃƒÂ¡ch_HÃƒÂ ng]', '[Voucher_Code]'],
            [$name, $name, $name, $name, $this->voucherCode],
            $content ?? ''
        );

        return $this->containsHtml($content) ? $content : nl2br($content, false);
    }

    private function resolveCoupon($event): ?Coupon
    {
        if ($event instanceof Coupon) {
            return $event;
        }

        if (!$this->voucherCode) {
            return null;
        }

        return Coupon::where('code', $this->voucherCode)->first();
    }

    private function resolveDiscountLabel(?Coupon $coupon): string
    {
        if (!$coupon || $coupon->value === null) {
            return 'Theo mã ưu đãi';
        }

        $value = (float) $coupon->value;
        $formattedValue = floor($value) === $value
            ? number_format($value, 0, ',', '.')
            : number_format($value, 2, ',', '.');

        if (in_array($coupon->type, ['percentage', 'percent', 'birthday'], true)) {
            return $formattedValue . '%';
        }

        if (in_array($coupon->type, ['fixed', 'fixed_amount'], true)) {
            return $formattedValue . 'đ';
        }

        return $formattedValue;
    }

    private function resolveExpiresAtLabel(?Coupon $coupon): string
    {
        if (!$coupon) {
            return 'Theo mã ưu đãi';
        }

        if (!$coupon->expires_at) {
            return 'Không giới hạn';
        }

        return Carbon::parse($coupon->expires_at)->format('d/m/Y');
    }

    private function resolveApplicableScopeLabel(?Coupon $coupon): string
    {
        if (!$coupon) {
            return 'Theo điều kiện mã ưu đãi';
        }

        $minSpend = (float) ($coupon->min_spend ?? 0);

        if ($minSpend > 0) {
            return 'Đơn hàng từ ' . number_format($minSpend, 0, ',', '.') . 'đ';
        }

        return 'Mọi đơn hàng hợp lệ';
    }

    private function containsHtml(string $content): bool
    {
        return $content !== strip_tags($content);
    }
}
