<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('affiliate_applications')) {
            return;
        }

        DB::statement("ALTER TABLE affiliate_applications MODIFY status ENUM('pending','approved','rejected','revoked') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        if (!Schema::hasTable('affiliate_applications')) {
            return;
        }

        DB::table('affiliate_applications')
            ->where('status', 'revoked')
            ->update(['status' => 'approved']);

        DB::statement("ALTER TABLE affiliate_applications MODIFY status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending'");
    }
};
