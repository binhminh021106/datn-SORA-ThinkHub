<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            if (!Schema::hasColumn('email_logs', 'event_type')) {
                $table->string('event_type')->default('birthday')->after('user_id');
            }

            if (!Schema::hasColumn('email_logs', 'sent_at')) {
                $table->timestamp('sent_at')->nullable()->after('event_type');
            }

            if (!Schema::hasColumn('email_logs', 'status')) {
                $table->string('status')->default('success')->after('sent_at');
            }
        });

        Schema::table('holiday_events', function (Blueprint $table) {
            if (!Schema::hasColumn('holiday_events', 'name')) {
                $table->string('name')->default('Untitled event')->after('id');
            }

            if (!Schema::hasColumn('holiday_events', 'target_audience')) {
                $table->string('target_audience')->default('all')->after('event_date');
            }

            if (!Schema::hasColumn('holiday_events', 'email_subject')) {
                $table->string('email_subject')->default('SORA ThinkHub')->after('target_audience');
            }

            if (!Schema::hasColumn('holiday_events', 'email_content')) {
                $table->text('email_content')->nullable()->after('email_subject');
            }

            if (!Schema::hasColumn('holiday_events', 'voucher_code')) {
                $table->string('voucher_code')->nullable()->after('email_content');
            }
        });
    }

    public function down(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            foreach (['event_type', 'sent_at', 'status'] as $column) {
                if (Schema::hasColumn('email_logs', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::table('holiday_events', function (Blueprint $table) {
            foreach (['name', 'target_audience', 'email_subject', 'email_content', 'voucher_code'] as $column) {
                if (Schema::hasColumn('holiday_events', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
