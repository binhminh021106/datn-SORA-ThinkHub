<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\MembershipTier;
use App\Services\EmailCampaignService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use ReflectionClass;

class EmailCampaignServiceTest extends TestCase
{
    use RefreshDatabase;

    public function test_get_user_tier_name_mapping()
    {
        $service = $this->app->make(EmailCampaignService::class);
        $reflection = new ReflectionClass(EmailCampaignService::class);
        $method = $reflection->getMethod('getUserTierName');
        $method->setAccessible(true);

        // 1. Không có tier
        $userNoTier = User::factory()->create(['tier_id' => null]);
        $this->assertEquals('regular', $method->invoke($service, $userNoTier));

        // 2. Tier Bạc (chứa "bạc" hoặc "silver") -> có ID là 2 (theo legacy) hoặc động
        $silverTier = MembershipTier::create(['name' => 'Thành viên Bạc', 'min_spent' => 1000]);
        $userSilver = User::factory()->create(['tier_id' => $silverTier->id]);
        $this->assertEquals('silver', $method->invoke($service, $userSilver));

        // 3. Tier Vàng (chứa "vàng" hoặc "gold") -> có ID là 3 (theo legacy) hoặc động
        $goldTier = MembershipTier::create(['name' => 'Hạng Vàng', 'min_spent' => 2000]);
        $userGold = User::factory()->create(['tier_id' => $goldTier->id]);
        $this->assertEquals('gold', $method->invoke($service, $userGold));

        // 4. Tier Kim Cương (chứa "kim cương" hoặc "diamond") -> có ID là 4 (theo legacy) hoặc động
        $diamondTier = MembershipTier::create(['name' => 'Khách hàng Kim cương VIP', 'min_spent' => 3000]);
        $userDiamond = User::factory()->create(['tier_id' => $diamondTier->id]);
        $this->assertEquals('diamond', $method->invoke($service, $userDiamond));

        // 5. Tier Không xác định -> regular
        $otherTier = MembershipTier::create(['name' => 'Hạng Đồng', 'min_spent' => 500]);
        $userOther = User::factory()->create(['tier_id' => $otherTier->id]);
        $this->assertEquals('regular', $method->invoke($service, $userOther));
    }
}
