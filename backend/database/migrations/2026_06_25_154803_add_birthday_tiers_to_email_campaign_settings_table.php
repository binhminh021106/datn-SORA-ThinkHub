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
    Schema::table('email_campaign_settings', function (Blueprint $table) {
        $table->json('birthday_tiers')->nullable()->after('birthday_content');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_campaign_settings', function (Blueprint $table) {
            //
        });
    }
};
