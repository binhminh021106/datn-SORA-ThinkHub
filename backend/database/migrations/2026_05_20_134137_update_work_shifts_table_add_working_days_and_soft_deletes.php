<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->json('working_days')->nullable()->after('is_overnight');
            $table->softDeletes(); // Thêm cơ chế xóa mềm (deleted_at)
        });
    }

    public function down()
    {
        Schema::table('work_shifts', function (Blueprint $table) {
            $table->dropColumn('working_days');
            $table->dropSoftDeletes();
        });
    }
};
