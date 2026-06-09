<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    private bool $sentByAdmin;

    public function __construct(Message $message, bool $sentByAdmin = false)
    {
        $this->message = $message;
        $this->sentByAdmin = $sentByAdmin;
    }

    public function broadcastOn(): array
    {
        $channelNames = [
            'chat.' . $this->message->receiver_id,
        ];

        if ($this->message->sender_id !== $this->message->receiver_id) {
            $channelNames[] = 'chat.' . $this->message->sender_id;
        }

        if (!$this->sentByAdmin) {
            $channelNames[] = 'admin.chat';
        }

        return array_map(
            fn ($channel) => new PrivateChannel($channel),
            array_values(array_unique($channelNames))
        );
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'content' => $this->message->content,
            'sender_name' => $this->message->sender->name ?? null,
            'sender_avatar' => $this->message->sender->avatar ?? null,
        ];
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }
}
