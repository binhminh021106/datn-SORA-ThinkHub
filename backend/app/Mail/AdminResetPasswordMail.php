<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AdminResetPasswordMail extends Mailable
{
    use Queueable, SerializesModels;

    public $admin;
    public $token;

    public function __construct($admin, $token)
    {
        $this->admin = $admin;
        $this->token = $token;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '[SORA] Yêu cầu đặt lại mật khẩu quản trị viên',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.admin_reset_password',
        );
    }
}