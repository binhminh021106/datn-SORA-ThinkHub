<?php

namespace App\Mail;

use App\Models\Coupon;
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

    public function __construct($user, $event, $holidayName = null)
    {
        $this->user = $user;
        $this->event = $event;
        $this->holidayName = $holidayName ?: ($event->name ?? 'su kien SORA');
        $this->eventName = $this->holidayName;
        $this->voucherCode = $event->voucher_code ?? ($event->code ?? null);
        $this->emailContent = $this->prepareEmailContent($event->email_content ?? '');
        $this->discount = $this->resolveDiscountLabel($event);
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

    private function resolveDiscountLabel($event): string
    {
        $coupon = null;

        if ($event instanceof Coupon) {
            $coupon = $event;
        } elseif ($this->voucherCode) {
            $coupon = Coupon::where('code', $this->voucherCode)->first();
        }

        if (!$coupon || $coupon->value === null) {
            return 'Theo mã ưu đãi';
        }

        $value = (float) $coupon->value;
        $formattedValue = floor($value) === $value
            ? number_format($value, 0, ',', '.')
            : number_format($value, 2, ',', '.');

        if ($coupon->type === 'percentage') {
            return $formattedValue . '%';
        }

        if ($coupon->type === 'fixed' || $coupon->type === 'fixed_amount') {
            return $formattedValue . 'đ';
        }

        return $formattedValue;
    }

    private function containsHtml(string $content): bool
    {
        return $content !== strip_tags($content);
    }
}
