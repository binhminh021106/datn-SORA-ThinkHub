<?php

namespace App\Console\Commands;

use App\Services\EmailCampaignService;
use Illuminate\Console\Command;

class AutoSendCampaignEmails extends Command
{
    protected $signature = 'email-campaign:auto-send';

    protected $description = 'Auto scan and send birthday and holiday campaign emails.';

    public function handle(EmailCampaignService $emailCampaignService): int
    {
        $this->info('Starting auto email campaigns...');

        $birthdayResult = $emailCampaignService->sendBirthdayCampaign(
            respectAutoSetting: true,
            preventDuplicateSends: true
        );
        $this->info($birthdayResult['message'] ?? 'Birthday campaign completed.');

        $holidayResult = $emailCampaignService->sendHolidayCampaign(preventDuplicateSends: true);
        $this->info($holidayResult['message'] ?? 'Holiday campaign completed.');

        $this->info('Auto email campaigns completed.');

        return self::SUCCESS;
    }
}
