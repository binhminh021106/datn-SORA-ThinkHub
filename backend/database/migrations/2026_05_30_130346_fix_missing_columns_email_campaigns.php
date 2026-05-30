<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        // 1. Thêm cột user_id vào email_logs nếu chưa có
        Schema::table('email_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('email_logs', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable();
            }
        });

        // 2. Thêm cột event_date và status vào holiday_events nếu chưa có
        Schema::table('holiday_events', function (Blueprint $table) {
            if (!Schema::hasColumn('holiday_events', 'event_date')) {
                $table->string('event_date', 10)->nullable(); // Đã bỏ after('name')
            }
            
            if (!Schema::hasColumn('holiday_events', 'status')) {
                $table->string('status')->default('active'); // Đã bỏ after('voucher_code')
            }
        });
    }

    public function down()
    {
        Schema::table('email_logs', function (Blueprint $table) {
            $table->dropColumn('user_id');
        });

        Schema::table('holiday_events', function (Blueprint $table) {
            $table->dropColumn(['event_date', 'status']);
        });
    }
};