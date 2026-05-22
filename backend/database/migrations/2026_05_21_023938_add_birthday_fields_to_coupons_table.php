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
        Schema::table('coupons', function (Blueprint $table) {
            if (!Schema::hasColumn('coupons', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
            }
            if (!Schema::hasColumn('coupons', 'is_used')) {
                $table->boolean('is_used')->default(false)->after('expires_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('coupons', function (Blueprint $table) {
            if (Schema::hasColumn('coupons', 'user_id')) {
                $table->dropColumn('user_id');
            }
            if (Schema::hasColumn('coupons', 'is_used')) {
                $table->dropColumn('is_used');
            }
        });
    }
};
