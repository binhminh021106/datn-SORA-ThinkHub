# Legacy Email Campaign Backup

These files were moved out of Laravel's active `app/` and `resources/views/` paths because they belong to the old birthday/holiday email flow.

Active flow:
- `app/Services/EmailCampaignService.php`
- `app/Console/Commands/AutoSendCampaignEmails.php`
- `app/Mail/BirthdayVoucherMail.php`
- `app/Mail/HolidayCouponMail.php`
- `routes/console.php` schedules `email-campaign:auto-send`

Legacy files kept here for reference only:
- `Console/Commands/RunDailyCampaigns.php`
- `Console/Commands/SendBirthdayEmails.php`
- `Console/Commands/ResetBirthdayEmails.php`
- `Mail/BirthdayCouponMail.php`
- `resources/views/emails/birthday_coupon.blade.php`

