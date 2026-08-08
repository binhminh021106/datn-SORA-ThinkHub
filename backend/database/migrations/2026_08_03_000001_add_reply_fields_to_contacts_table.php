<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasReplySubject = Schema::hasColumn('contacts', 'reply_subject');
        $hasReplyMessage = Schema::hasColumn('contacts', 'reply_message');
        $hasRepliedAt = Schema::hasColumn('contacts', 'replied_at');
        $hasRepliedBy = Schema::hasColumn('contacts', 'replied_by');

        Schema::table('contacts', function (Blueprint $table) use ($hasReplySubject, $hasReplyMessage, $hasRepliedAt, $hasRepliedBy) {
            if (! $hasReplySubject) {
                $table->string('reply_subject')->nullable()->after('message');
            }

            if (! $hasReplyMessage) {
                $table->text('reply_message')->nullable()->after('reply_subject');
            }

            if (! $hasRepliedAt) {
                $table->timestamp('replied_at')->nullable()->after('reply_message');
            }

            if (! $hasRepliedBy) {
                $table->bigInteger('replied_by')->nullable()->after('replied_at');
            } else {
                $table->bigInteger('replied_by')->nullable()->change();
            }
        });

        Schema::table('contacts', function (Blueprint $table) {
            $table->foreign('replied_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('replied_by');
            $table->dropColumn(['reply_subject', 'reply_message', 'replied_at']);
        });
    }
};
