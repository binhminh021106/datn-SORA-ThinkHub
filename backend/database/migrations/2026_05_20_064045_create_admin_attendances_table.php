<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admin_attendances', function (Blueprint $table) {
            $table->id(); // Tự động tạo bigint UNSIGNED làm khóa chính cho bảng này
            
            // Khóa ngoại liên kết với bảng admins. 
            // Cần dùng bigInteger (có dấu) để đồng bộ hoàn toàn với kiểu 'bigint' của bảng admins trong file sql.
            $table->bigInteger('admin_id'); 
            
            $table->date('attendance_date')->comment('Ngày chấm công thực tế (Y-m-d)');
            $table->dateTime('clock_in')->nullable()->comment('Thời gian bấm check-in hành chính');
            $table->dateTime('clock_out')->nullable()->comment('Thời gian bấm check-out hành chính');
            
            // Trạng thái lúc vào làm
            $table->enum('status', ['present', 'late', 'absent', 'on_leave'])
                  ->default('present')
                  ->comment('Trạng thái đi làm: Đúng giờ, Muộn, Vắng, Nghỉ phép');
                  
            // Trạng thái lúc ra về (Giải quyết triệt để bài toán quên checkout)
            $table->enum('checkout_status', ['pending', 'completed', 'forgotten'])
                  ->default('pending')
                  ->comment('Trạng thái về: Chưa về, Đã checkout, Quên checkout hệ thống đóng');
            
            // Xác thực không phần cứng (IP và Thiết bị)
            $table->string('ip_address', 45)->nullable()->comment('Lưu IP mạng để đối soát vị trí');
            $table->text('user_agent')->nullable()->comment('Lưu thông tin trình duyệt/thiết bị (VD: ASUS TUF)');
            
            $table->text('note')->nullable()->comment('Lý do đi muộn hoặc giải trình từ nhân sự');
            $table->timestamps(); // Tạo sẵn created_at và updated_at

            // Thiết lập ràng buộc khóa ngoại (Foreign Key)
            $table->foreign('admin_id')
                  ->references('id')
                  ->on('admins')
                  ->onDelete('cascade'); // Nếu xóa tài khoản admin, dữ liệu chấm công tự động xóa theo

            // Tạo chỉ mục (Index) kép để tối ưu hóa tốc độ truy vấn lịch sử theo ngày của từng nhân sự
            $table->index(['admin_id', 'attendance_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_attendances');
    }
};