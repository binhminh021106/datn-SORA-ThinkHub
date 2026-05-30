<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('email_logs', 'voucher_code')) {
                $table->string('voucher_code')->nullable()->after('status');
            }

            if (!Schema::hasColumn('email_logs', 'action_url')) {
                $table->text('action_url')->nullable()->after('voucher_code');
            }
        });
    }

    public function down(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            if (Schema::hasColumn('email_logs', 'action_url')) {
                $table->dropColumn('action_url');
            }

            if (Schema::hasColumn('email_logs', 'voucher_code')) {
                $table->dropColumn('voucher_code');
            }
        });
    }
};
