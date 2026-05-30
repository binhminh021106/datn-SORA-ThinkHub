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
    ];

    protected function casts(): array
    {
        return [
            'is_auto_birthday' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return self::query()->first() ?: self::create([
            'is_auto_birthday' => true,
            'birthday_subject' => 'Chuc mung sinh nhat [Ten_Khach_Hang]',
            'birthday_content' => "Xin chao [Ten_Khach_Hang],\n\nSORA ThinkHub gui den ban loi chuc sinh nhat va mot uu dai dac biet: [Voucher_Code].",
        ]);
    }
}
