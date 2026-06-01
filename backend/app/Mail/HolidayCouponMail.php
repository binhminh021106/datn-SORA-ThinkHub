<?php

namespace App\Mail;

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

    public function __construct($user, $event, $holidayName = null)
    {
        $this->user = $user;
        $this->event = $event;
        $this->holidayName = $holidayName ?: ($event->name ?? 'su kien SORA');
    }

    public function build()
    {
        $subject = $this->event->email_subject
            ?? "SORA ThinkHub - Uu dai dac biet dip {$this->holidayName}";

        return $this->subject($subject)
            ->view('emails.holiday_coupon');
    }
}
