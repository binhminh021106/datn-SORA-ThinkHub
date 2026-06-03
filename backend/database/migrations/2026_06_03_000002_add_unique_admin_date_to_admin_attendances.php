<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const UNIQUE_INDEX = 'admin_attendances_admin_date_unique';

    public function up(): void
    {
        $duplicate = DB::table('admin_attendances')
            ->select('admin_id', 'attendance_date')
            ->groupBy('admin_id', 'attendance_date')
            ->havingRaw('COUNT(*) > 1')
            ->first();

        if ($duplicate) {
            throw new \RuntimeException(
                sprintf(
                    'Cannot add unique attendance constraint: admin_id %s has duplicate records on %s.',
                    $duplicate->admin_id,
                    $duplicate->attendance_date
                )
            );
        }

        Schema::table('admin_attendances', function (Blueprint $table) {
            $table->unique(['admin_id', 'attendance_date'], self::UNIQUE_INDEX);
        });
    }

    public function down(): void
    {
        Schema::table('admin_attendances', function (Blueprint $table) {
            $table->dropUnique(self::UNIQUE_INDEX);
        });
    }
};
