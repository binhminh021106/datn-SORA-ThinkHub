<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InventoryUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $type; // 'variant'|'combo' etc
    public $id;
    public $payload;

    public function __construct(string $type, int $id = 0, array $payload = [])
    {
        $this->type = $type;
        $this->id = $id;
        $this->payload = $payload;
    }

    public function broadcastOn(): array
    {
        // Inventory changes are relevant to admin; combos/products may also trigger public-admin updates
        $channels = [new PrivateChannel('admin')];
        if (in_array($this->type, ['product', 'combo'], true)) {
            $channels[] = new Channel('public-admin');
        }
        return $channels;
    }

    public function broadcastAs()
    {
        return 'InventoryUpdated';
    }
}
