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
            $table->foreign('replied_by')->references('id')->on('admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $foreignKeys = array_map(function ($fk) {
                return $fk['name'];
            }, Schema::getForeignKeys('contacts'));

            if (in_array('contacts_replied_by_foreign', $foreignKeys)) {
                $table->dropForeign('contacts_replied_by_foreign');
            }

            $columnsToDrop = [];
            if (Schema::hasColumn('contacts', 'reply_subject')) $columnsToDrop[] = 'reply_subject';
            if (Schema::hasColumn('contacts', 'reply_message')) $columnsToDrop[] = 'reply_message';
            if (Schema::hasColumn('contacts', 'replied_at')) $columnsToDrop[] = 'replied_at';
            if (Schema::hasColumn('contacts', 'replied_by')) $columnsToDrop[] = 'replied_by';

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });
    }
};
