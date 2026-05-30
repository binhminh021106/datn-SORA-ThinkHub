<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('holiday_events', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Tên lễ (VD: 8/3 Quốc tế phụ nữ)
            
            // Ngày diễn ra (Định dạng DD/MM, VD: 08/03)
            $table->string('event_date'); 
            
            // Đối tượng (all, male, female, vip...)
            $table->string('target_audience')->default('all'); 
            
            $table->string('email_subject');
            $table->text('email_content');
            $table->string('voucher_code')->nullable();
            
            // Trạng thái kích hoạt
            $table->enum('status', ['active', 'inactive'])->default('active'); 
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('holiday_events');
    }
};