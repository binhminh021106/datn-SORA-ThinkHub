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
        Schema::table('holiday_events', function (Blueprint $table) {
            $table->string('discount_type', 50)->default('percentage')->after('voucher_code');
            $table->bigInteger('discount_value')->nullable()->after('discount_type');
            $table->bigInteger('min_spend')->default(0)->after('discount_value');
            $table->integer('usage_limit_per_user')->default(1)->after('min_spend');
            $table->integer('validity_days')->default(7)->after('usage_limit_per_user');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('holiday_events', function (Blueprint $table) {
            $table->dropColumn([
                'discount_type',
                'discount_value',
                'min_spend',
                'usage_limit_per_user',
                'validity_days',
            ]);
        });
    }
};
