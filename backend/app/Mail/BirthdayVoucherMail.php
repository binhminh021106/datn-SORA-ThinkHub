<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\User;
use App\Models\Coupon;
use App\Models\EmailLog;
use Throwable;
use Symfony\Component\Mime\Email;

class BirthdayVoucherMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $user;
    public $coupon;
    public $emailLogId;

    /**
     * Create a new message instance.
     */
    public function __construct(User $user, Coupon $coupon, ?int $emailLogId = null)
    {
        $this->user = $user;
        $this->coupon = $coupon;
        $this->emailLogId = $emailLogId;
    }

    public function failed(Throwable $exception): void
    {
        if ($this->emailLogId) {
            EmailLog::whereKey($this->emailLogId)->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
            ]);
        }
    }

    public function withSymfonyMessage(Email $message): void
    {
        if ($this->emailLogId) {
            $message->getHeaders()->addTextHeader('X-SORA-Email-Log-ID', (string) $this->emailLogId);
        }
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Chúc mừng sinh nhật từ SORA ThinkHub! Nhận ngay quà tặng!',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.birthday_voucher',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
