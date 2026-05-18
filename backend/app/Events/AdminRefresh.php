<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AdminRefresh implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $module;
    public $message;
    public $time;

    public function __construct(string $module, string $message = null, string $time = null)
    {
        $this->module = $module;
        $this->message = $message;
        $this->time = $time;
    }

    public function broadcastOn(): array
    {
        $channels = [new PrivateChannel('admin')];

        if (in_array($this->module, ['products', 'combos'], true)) {
            $channels[] = new Channel('public-admin');
        }

        return $channels;
    }

    public function broadcastAs()
    {
        return 'AdminRefresh';
    }
}
