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
        Schema::create('document_recipients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected', 'returned', 'forwarded'])->default('pending');
            $table->text('comments')->nullable();
            $table->timestamp('responded_at')->nullable();
            $table->integer('sequence')->default(1); // Order in the approval chain
            $table->foreignId('forwarded_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('forwarded_to')->nullable()->constrained('users')->onDelete('set null');
            $table->boolean('is_active')->default(true); // Whether this recipient should currently receive the document
            $table->boolean('is_final_approver')->default(false); // Whether this recipient can give final approval
            $table->timestamps();

            // Ensure a user can only be a recipient once per document
            $table->unique(['document_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('document_recipients');
    }
};
