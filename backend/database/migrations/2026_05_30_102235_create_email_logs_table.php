<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('email_logs', function (Blueprint $table) {
            $table->id();
            // Liên kết với bảng users (Khách hàng)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Loại sự kiện: 'birthday' hoặc 'holiday_EVT001'
            $table->string('event_type'); 
            
            // Thời gian gửi
            $table->timestamp('sent_at');
            
            // Trạng thái: success, failed
            $table->string('status')->default('success'); 
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_logs');
    }
};