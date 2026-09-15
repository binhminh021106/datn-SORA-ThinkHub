<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class RecalculateTiers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tier:recalculate';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Recalculate membership tiers for all users based on their delivered and paid orders';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting tier recalculation for all users...');

        $users = \App\Models\User::all();
        $count = 0;

        foreach ($users as $user) {
            $stats = \App\Models\Order::where('user_id', $user->id)
                ->where('status', 'delivered')
                ->where('payment_status', 'paid')
                ->select(
                    \Illuminate\Support\Facades\DB::raw('COALESCE(SUM(total_amount), 0) as total_spent'),
                    \Illuminate\Support\Facades\DB::raw('COUNT(id) as total_orders')
                )
                ->first();

            $totalSpent = $stats->total_spent ?? 0;
            $totalOrders = $stats->total_orders ?? 0;

            $user->accumulated_spent = $totalSpent;
            $user->accumulated_orders = $totalOrders;

            $newTier = \App\Models\MembershipTier::where(function($query) use ($totalSpent, $totalOrders) {
                    $query->where('min_spent', '<=', $totalSpent)
                          ->orWhere('min_orders', '<=', $totalOrders);
                })
                ->orderBy('min_spent', 'desc')
                ->first();

            if ($newTier && $user->tier_id !== $newTier->id) {
                $oldTierId = $user->tier_id;
                $user->tier_id = $newTier->id;

                \App\Models\TierHistory::create([
                    'user_id'     => $user->id,
                    'old_tier_id' => $oldTierId,
                    'new_tier_id' => $newTier->id,
                    'reason'      => 'Quét lại hệ thống tự động: Đạt ' . number_format($totalSpent) . ' VNĐ / ' . $totalOrders . ' đơn',
                    'created_at'  => now()
                ]);
                
                $count++;
                $this->info("User {$user->id} ({$user->email}) upgraded to Tier {$newTier->name}");
            }

            $user->save();
        }

        $this->info("Recalculation complete. Updated {$count} users.");
    }
}
