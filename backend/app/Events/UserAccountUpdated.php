<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class UserAccountUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $userId;
    public $payload;

    public function __construct(int $userId, array $payload = [])
    {
        $this->userId = $userId;
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('admin')];

        // notify the specific user on their private channel
        $channels[] = new PrivateChannel('App.Models.User.' . $this->userId);

        return $channels;
    }

    public function broadcastAs()
    {
        return 'UserAccountUpdated';
    }
}
