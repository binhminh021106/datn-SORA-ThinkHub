<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\Coupon;

class BirthdayVoucherNotification extends Notification
{
    use Queueable;

    public $coupon;

    /**
     * Create a new notification instance.
     */
    public function __construct(Coupon $coupon)
    {
        $this->coupon = $coupon;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database']; // In-app notification
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => '🎉 Chúc mừng Sinh Nhật!',
            'message' => 'SORA ThinkHub tặng bạn mã giảm giá sinh nhật: ' . $this->coupon->code . '. Hạn dùng 7 ngày!',
            'coupon_id' => $this->coupon->id,
            'type' => 'birthday_voucher'
        ];
    }
}
