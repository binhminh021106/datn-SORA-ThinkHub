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
        Schema::table('email_logs', function (Blueprint $table) {
            $table->unsignedSmallInteger('campaign_year')->nullable()->after('event_type');
            $table->unique(['user_id', 'event_type', 'campaign_year'], 'unique_user_event_year');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_logs', function (Blueprint $table) {
            $table->dropUnique('unique_user_event_year');
            $table->dropColumn('campaign_year');
        });
    }
};
