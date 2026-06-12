<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\Coupon;
use Illuminate\Support\Facades\Mail;
use App\Mail\BirthdayCouponMail;
use App\Mail\HolidayCouponMail;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class RunDailyCampaigns extends Command
{
    // Tên lệnh dùng để gọi trong Schedule
    protected $signature = 'sora:daily-campaigns';

    protected $description = 'Hệ thống tự động: Quét sinh nhật và Ngày lễ để gửi ưu đãi cho Khách hàng';

    // BẢNG ĐIỀU KHIỂN CÁC NGÀY LỄ (Sếp cứ thêm sửa tùy ý)
    protected $holidays = [
        '02-14' => ['name' => 'Valentine Lễ Tình Nhân', 'discount' => 14, 'code_prefix' => 'VALEN'],
        '03-08' => ['name' => 'Quốc Tế Phụ Nữ 8/3', 'discount' => 15, 'code_prefix' => 'WMDAY'],
        '10-20' => ['name' => 'Phụ Nữ Việt Nam 20/10', 'discount' => 20, 'code_prefix' => 'PNVN'],
        '11-25' => ['name' => 'Black Friday', 'discount' => 30, 'code_prefix' => 'BLACK'],
        '12-24' => ['name' => 'Lễ Giáng Sinh', 'discount' => 25, 'code_prefix' => 'XMAS'],
        '01-01' => ['name' => 'Chúc Mừng Năm Mới', 'discount' => 20, 'code_prefix' => 'NYEAR'],
        // '04-05' => ['name' => 'Ngày Test', 'discount' => 50, 'code_prefix' => 'TEST'], // Uncomment dòng này và sửa ngày để Test
    ];

    public function handle()
    {
        $today = Carbon::today();
        $todayStr = $today->format('m-d');
        
        $this->info("=== BẮT ĐẦU CHẠY CHIẾN DỊCH NGÀY {$today->format('d/m/Y')} ===");

        // ========================================================
        // NHÁNH 1: QUÉT VÀ TẶNG QUÀ SINH NHẬT (CÁ NHÂN HÓA)
        // ========================================================
        $birthdayUsers = User::whereMonth('date_of_birth', $today->month)
                             ->whereDay('date_of_birth', $today->day)
                             ->where('status', 'active')
                             ->whereNotNull('email')
                             ->get();

        if ($birthdayUsers->isNotEmpty()) {
            $this->info("-> Tìm thấy {$birthdayUsers->count()} khách hàng có sinh nhật hôm nay.");
            
            foreach ($birthdayUsers as $user) {
                try {
                    // Tạo mã độc quyền: VD HPBD26ABC12
                    $couponCode = 'HPBD' . $today->format('y') . strtoupper(Str::random(3)) . $user->id;
                    
                    $coupon = Coupon::create([
                        'code'           => $couponCode,
                        'name'           => 'Quà sinh nhật của ' . ($user->fullName ?? $user->name),
                        'type'           => 'percentage', 
                        'value'          => 15, // GIẢM 15% CHO SINH NHẬT
                        'min_spend'      => 0,            
                        'usage_limit'    => 1,            
                        'usage_count'    => 0,
                        'status'         => 'active',
                        'expires_at'     => $today->copy()->addDays(14), // Hạn 14 ngày
                    ]);

                    // Ném mail vào Redis Queue
                    Mail::to($user->email)->queue(new BirthdayCouponMail($user, $coupon));
                    $this->line("   + Đã lên lịch gửi mail SN cho: {$user->email}");

                } catch (\Exception $e) {
                    Log::error("Lỗi tạo Coupon SN cho User {$user->id}: " . $e->getMessage());
                }
            }
        } else {
            $this->line("-> Không có khách hàng nào sinh nhật hôm nay.");
        }

        // ========================================================
        // NHÁNH 2: QUÉT NGÀY LỄ LỚN (GỬI ĐẠI TRÀ)
        // ========================================================
        if (array_key_exists($todayStr, $this->holidays)) {
            $holiday = $this->holidays[$todayStr];
            $this->info("-> Phát hiện sự kiện: {$holiday['name']}! Đang chuẩn bị gửi đại trà...");

            $masterCode = 'SORA' . $holiday['code_prefix'] . $today->format('y');
            
            // Tạo 1 Mã Master dùng chung cho 10.000 người
            $coupon = Coupon::firstOrCreate(
                ['code' => $masterCode],
                [
                    'name'           => 'Khuyến mãi ' . $holiday['name'],
                    'type'           => 'percentage',
                    'value'          => $holiday['discount'],
                    'min_spend'      => 0,
                    'usage_limit'    => 10000, 
                    'usage_count'    => 0,
                    'status'         => 'active',
                    'expires_at'     => Carbon::now()->addDays(7), // Hạn 7 ngày
                ]
            );

            // Quét toàn bộ User chia nhỏ 100 người/lần để RAM không bị nổ
            $holidayCount = 0;
            User::where('status', 'active')->whereNotNull('email')->chunk(100, function ($users) use ($coupon, $holiday, &$holidayCount) {
                foreach ($users as $user) {
                    try {
                        Mail::to($user->email)->queue(new HolidayCouponMail($user, $coupon, $holiday['name']));
                        $holidayCount++;
                    } catch (\Exception $e) {
                        Log::error("Lỗi gửi mail Lễ cho {$user->email}: " . $e->getMessage());
                    }
                }
            });
            $this->line("   + Đã lên lịch gửi {$holidayCount} mail sự kiện kèm mã {$masterCode}");
        } else {
            $this->line("-> Hôm nay không có sự kiện Lễ hội nào.");
        }

        $this->info("=== HOÀN TẤT CHIẾN DỊCH! ===");
        return 0;
    }
}