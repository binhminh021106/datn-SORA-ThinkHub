<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('admin_face_profiles')) {
            Schema::create('admin_face_profiles', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('admin_id');
                $table->json('face_descriptors');
                $table->unsignedTinyInteger('sample_count')->default(1);
                $table->string('model_name', 100)->default('face-api.js');
                $table->string('model_version', 50)->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamp('registered_at')->nullable()->useCurrent();
                $table->timestamp('last_verified_at')->nullable();
                $table->timestamps();

                $table->unique('admin_id');
                $table->foreign('admin_id')->references('id')->on('admins')->cascadeOnDelete()->cascadeOnUpdate();
            });
        }

        if (!Schema::hasTable('face_verification_logs')) {
            Schema::create('face_verification_logs', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('admin_id')->nullable();
                $table->unsignedBigInteger('attendance_id')->nullable();
                $table->string('action', 30);
                $table->boolean('is_matched')->default(false);
                $table->decimal('face_distance', 8, 6)->nullable();
                $table->decimal('threshold', 8, 6)->default(0.48);
                $table->string('ip_address', 45)->nullable();
                $table->text('user_agent')->nullable();
                $table->string('note', 255)->nullable();
                $table->timestamps();

                $table->index('admin_id');
                $table->index('attendance_id');
                $table->index('created_at');
                $table->index('is_matched');
                $table->foreign('admin_id')->references('id')->on('admins')->nullOnDelete()->cascadeOnUpdate();
                $table->foreign('attendance_id')->references('id')->on('admin_attendances')->nullOnDelete()->cascadeOnUpdate();
            });
        }

        Schema::table('admin_attendances', function (Blueprint $table) {
            if (!Schema::hasColumn('admin_attendances', 'check_in_method')) {
                $table->string('check_in_method', 30)->nullable()->after('clock_in');
            }

            if (!Schema::hasColumn('admin_attendances', 'check_in_face_distance')) {
                $table->decimal('check_in_face_distance', 8, 6)->nullable()->after('check_in_method');
            }

            if (!Schema::hasColumn('admin_attendances', 'check_out_method')) {
                $table->string('check_out_method', 30)->nullable()->after('clock_out');
            }

            if (!Schema::hasColumn('admin_attendances', 'check_out_face_distance')) {
                $table->decimal('check_out_face_distance', 8, 6)->nullable()->after('check_out_method');
            }
        });
    }

    public function down(): void
    {
        Schema::table('admin_attendances', function (Blueprint $table) {
            foreach (['check_in_method', 'check_in_face_distance', 'check_out_method', 'check_out_face_distance'] as $column) {
                if (Schema::hasColumn('admin_attendances', $column)) {
                    $table->dropColumn($column);
                }
            }
        });

        Schema::dropIfExists('face_verification_logs');
        Schema::dropIfExists('admin_face_profiles');
    }
};
