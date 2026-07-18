<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned', 'return_requested', 'return_negotiating', 'return_retrieving') DEFAULT 'pending'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'returned', 'return_requested') DEFAULT 'pending'");
    }
};
