<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_attempts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 20);
            $table->string('merchant_reference', 120)->unique();
            $table->string('gateway_request_id', 120)->nullable()->unique();
            $table->unsignedBigInteger('amount');
            $table->string('status', 20)->default('pending');
            $table->json('cart_snapshot')->nullable();
            $table->string('checkout_source', 20)->default('web');
            $table->string('mobile_return_url', 500)->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'gateway', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_attempts');
    }
};
