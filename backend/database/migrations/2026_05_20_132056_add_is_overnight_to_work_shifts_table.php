<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   public function up() {
    Schema::table('work_shifts', function (Blueprint $table) {
        $table->boolean('is_overnight')->default(false)->after('late_tolerance');
    });
}
public function down() {
    Schema::table('work_shifts', function (Blueprint $table) {
        $table->dropColumn('is_overnight');
    });
}
};
