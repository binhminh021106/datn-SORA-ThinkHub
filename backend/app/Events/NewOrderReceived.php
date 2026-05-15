<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewOrderReceived implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderCode;
    public $totalAmount;

    public function __construct(string $orderCode, float $totalAmount)
    {
        $this->orderCode = $orderCode;
        $this->totalAmount = $totalAmount;
    }

    public function broadcastOn(): array
    {
        return [new PrivateChannel('admin')];
    }

    public function broadcastAs()
    {
        return 'NewOrderReceived';
    }
}
