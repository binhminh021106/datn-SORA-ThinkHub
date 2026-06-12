<?php

namespace App\Mail;

use App\Models\EmailCampaignSetting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class BirthdayCouponMail extends Mailable
{
    use Queueable, SerializesModels;

    public $user;
    public $setting;

    public function __construct($user)
    {
        $this->user = $user;
        $this->setting = EmailCampaignSetting::current();
    }

    public function build()
    {
        $name = $this->user->fullName ?? $this->user->name ?? 'Quy khach';
        $subject = str_replace(
            ['[Ten_Khach_Hang]', '[Tên_Khách_Hàng]', '[TÃªn_KhÃ¡ch_HÃ ng]'],
            $name,
            $this->setting->birthday_subject
        );

        return $this->subject($subject)
            ->view('emails.birthday_coupon');
    }
}
