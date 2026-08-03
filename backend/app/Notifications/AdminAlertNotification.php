<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Broadcasting\PrivateChannel;

class AdminAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public $title;
    public $message;
    public $type;
    public $url;

    /**
     * Create a new notification instance.
     *
     * @return void
     */
    public function __construct($title, $message, $type = 'info', $url = '#')
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->url = $url;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function via($notifiable)
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the array representation of the notification for the database.
     *
     * @param  mixed  $notifiable
     * @return array
     */
    public function toDatabase($notifiable)
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'alert_type' => $this->type,
            'url' => $this->url,
        ];
    }

    /**
     * Get the broadcastable representation of the notification.
     *
     * @param  mixed  $notifiable
     * @return BroadcastMessage
     */
    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'id' => $this->id,
            'title' => $this->title,
            'message' => $this->message,
            'alert_type' => $this->type,
            'url' => $this->url,
        ]);
    }



    /**
     * The event name to be broadcast.
     *
     * @return string
     */
    public function broadcastAs()
    {
        return 'AdminAlert';
    }
}
