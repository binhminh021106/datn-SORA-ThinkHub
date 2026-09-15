<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $productId;
    public $payload;

    public function __construct(int $productId, array $payload = [])
    {
        $this->productId = $productId;
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('admin'), new Channel('public-admin')];
    }

    public function broadcastAs()
    {
        return 'ProductUpdated';
    }
}
