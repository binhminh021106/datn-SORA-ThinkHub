<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('admin_shift_assignments', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_shift_assignments', 'valid_from')) {
                $table->date('valid_from')->nullable()->after('work_shift_id');
            }

            if (!Schema::hasColumn('admin_shift_assignments', 'valid_to')) {
                $table->date('valid_to')->nullable()->after('valid_from');
            }
        });

        if (Schema::hasColumn('admin_shift_assignments', 'valid_from')) {
            DB::table('admin_shift_assignments')
                ->whereNull('valid_from')
                ->update([
                    'valid_from' => DB::raw('DATE(COALESCE(created_at, NOW()))'),
                ]);
        }
    }

    public function down(): void
    {
        Schema::table('admin_shift_assignments', function (Blueprint $table) {
            if (Schema::hasColumn('admin_shift_assignments', 'valid_to')) {
                $table->dropColumn('valid_to');
            }

            if (Schema::hasColumn('admin_shift_assignments', 'valid_from')) {
                $table->dropColumn('valid_from');
            }
        });
    }
};
