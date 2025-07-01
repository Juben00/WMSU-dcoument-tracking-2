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
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('order_number');
            $table->string('subject');
            $table->enum('status', ['draft', 'pending', 'in_review', 'approved', 'rejected', 'returned', 'cancelled', 'received'])->default('draft');
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(false);
            $table->string('public_token')->unique()->nullable();
            $table->string('barcode_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['is_public', 'public_token', 'barcode_path']);
        });
    }
};
