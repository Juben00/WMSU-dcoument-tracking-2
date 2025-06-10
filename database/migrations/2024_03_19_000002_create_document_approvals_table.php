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
        Schema::create('document_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('document_transfer_id')->constrained()->onDelete('cascade');
            $table->foreignId('approver_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['executive_assistant', 'vice_president', 'president', 'regular_approver']);
            $table->enum('status', ['pending', 'approved', 'rejected', 'returned_for_revision']);
            $table->text('comments')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->integer('approval_order')->default(1);
            $table->boolean('is_current_step')->default(false);
            $table->json('revision_attachments')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_approvals');
    }
};
