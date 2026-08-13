<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $hasForeignKey = collect(Schema::getForeignKeys('contacts'))
            ->contains(fn ($key) => in_array('replied_by', $key['columns'], true));

        Schema::table('contacts', function (Blueprint $table) use ($hasForeignKey) {
            if ($hasForeignKey) {
                $table->dropForeign(['replied_by']);
            }
            $table->bigInteger('replied_by')->nullable()->change();
            $table->foreign('replied_by')->references('id')->on('admins')->nullOnDelete();
        });
    }

    public function down(): void
    {
        $hasForeignKey = collect(Schema::getForeignKeys('contacts'))
            ->contains(fn ($key) => in_array('replied_by', $key['columns'], true));

        Schema::table('contacts', function (Blueprint $table) use ($hasForeignKey) {
            if ($hasForeignKey) {
                $table->dropForeign(['replied_by']);
            }
            $table->bigInteger('replied_by')->nullable()->change();
            $table->foreign('replied_by')->references('id')->on('users')->nullOnDelete();
        });
    }
};
