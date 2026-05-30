<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_campaign_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_auto_birthday')->default(true);
            $table->string('birthday_subject')->default('Chuc mung sinh nhat [Ten_Khach_Hang]');
            $table->text('birthday_content')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_campaign_settings');
    }
};
