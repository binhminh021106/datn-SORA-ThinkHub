<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;

    public function __construct(Message $message)
    {
        $this->message = $message;
    }

    /**
     * Phát sóng đồng thời trên kênh của CẢ HAI bên (gửi + nhận)
     * Giúp cả user lẫn admin thấy tin nhắn ngay lập tức mà không cần dùng toOthers()
     */
    public function broadcastOn(): array
    {
        $channels = [
            // Kênh người nhận (user hoặc admin)
            new PrivateChannel('chat.' . $this->message->receiver_id),
        ];

        // Thêm kênh người gửi nếu khác người nhận
        if ($this->message->sender_id !== $this->message->receiver_id) {
            $channels[] = new PrivateChannel('chat.' . $this->message->sender_id);
        }

        // Nếu tin nhắn được gửi bởi người dùng (không phải admin) → thông báo toàn cục cho admin
        if ($this->message->sender_id !== 1) {
            $channels[] = new PrivateChannel('admin.chat');
        }

        return $channels;
    }

    
    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'sender_id' => $this->message->sender_id,
            'receiver_id' => $this->message->receiver_id,
            'content' => $this->message->content,
            // Assuming Message has sender relationship
            'sender_name' => $this->message->sender->name ?? null,
            'sender_avatar' => $this->message->sender->avatar ?? null,
        ];
    }

    public function broadcastAs()
    {
        return 'MessageSent';
    }



}