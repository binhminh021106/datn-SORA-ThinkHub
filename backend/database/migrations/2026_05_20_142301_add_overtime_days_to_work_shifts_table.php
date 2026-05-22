<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::table('work_shifts', function (Blueprint $table) {
            // Lưu dưới dạng JSON để chứa mảng 7 giá trị boolean
            $table->json('overtime_days')->nullable();
        });
    }

    public function down() {
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropColumn('overtime_days');
        });
    }
};