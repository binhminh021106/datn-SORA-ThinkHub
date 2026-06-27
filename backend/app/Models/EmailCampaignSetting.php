<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailCampaignSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'is_auto_birthday',
        'birthday_subject',
        'birthday_content',
        'birthday_tiers',
    ];

    protected function casts(): array
    {
        return [
            'is_auto_birthday' => 'boolean',
            'birthday_tiers' => 'array',
        ];
    }

    public static function current(): self
    {
        return self::query()->first() ?: self::create([
            'is_auto_birthday' => true,
            'birthday_subject' => 'Chúc mừng sinh nhật [Tên_Khách_Hàng]',
            'birthday_content' => "Xin chào [Tên_Khách_Hàng],\n\nSORA ThinkHub gửi đến bạn lời chúc sinh nhật và một ưu đãi đặc biệt: [Voucher_Code].",
            'birthday_tiers' => [
                ['id' => 'regular', 'name' => 'Khách Thường', 'voucherCode' => 'BDAYREG', 'discount' => 'freeship'],
                ['id' => 'silver', 'name' => 'Hạng Bạc', 'voucherCode' => 'BDAYSILVER', 'discount' => '5%'],
                ['id' => 'gold', 'name' => 'Hạng Vàng', 'voucherCode' => 'BDAYGOLD', 'discount' => '10%'],
                ['id' => 'diamond', 'name' => 'Hạng Kim cương', 'voucherCode' => 'BDAYDIAMOND', 'discount' => '15%'],
            ],
        ]);
    }
     }
