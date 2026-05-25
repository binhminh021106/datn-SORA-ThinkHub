<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tạo bảng Ca làm việc
        Schema::create('work_shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Tên ca (VD: Ca Sáng, Ca Chiều, Hành Chính)');
            $table->time('start_time')->comment('Giờ bắt đầu ca (VD: 08:00:00)');
            $table->time('end_time')->comment('Giờ kết thúc ca (VD: 17:30:00)');
            $table->integer('late_tolerance')->default(0)->comment('Số phút cho phép đi muộn (VD: 15)');
            $table->timestamps();
        });

        // 2. Tạo bảng Phân ca cho Admin
        Schema::create('admin_shift_assignments', function (Blueprint $table) {
            $table->id();
            $table->bigInteger('admin_id');
            $table->foreignId('work_shift_id')->constrained('work_shifts')->onDelete('cascade');
            $table->timestamps();
            
            // Khóa ngoại liên kết với bảng admins
            $table->foreign('admin_id')->references('id')->on('admins')->onDelete('cascade');
        });

        // 3. Cập nhật bảng admin_attendances để lưu thông tin ca làm ngày hôm đó
        Schema::table('admin_attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_attendances', 'work_shift_id')) {
                $table->foreignId('work_shift_id')->nullable()->after('admin_id')->constrained('work_shifts')->onDelete('set null');
            }
            if (!Schema::hasColumn('admin_attendances', 'early_leave_minutes')) {
                $table->integer('early_leave_minutes')->default(0)->after('status')->comment('Số phút về sớm');
            }
            if (!Schema::hasColumn('admin_attendances', 'late_minutes')) {
                $table->integer('late_minutes')->default(0)->after('status')->comment('Số phút đi muộn');
            }
        });
    }

    public function down(): void
    {
        Schema::table('admin_attendances', function (Blueprint $table) {
            $table->dropForeign(['work_shift_id']);
            $table->dropColumn(['work_shift_id', 'early_leave_minutes', 'late_minutes']);
        });
        Schema::dropIfExists('admin_shift_assignments');
        Schema::dropIfExists('work_shifts');
    }
};