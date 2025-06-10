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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->enum('type', ['personal', 'academic', 'professional']);
            $table->enum('status', ['draft', 'pending', 'in_review', 'approved', 'rejected', 'returned_for_revision']);
            $table->enum('routing_type', ['direct', 'multi_recipient', 'presidential_chain']);
            $table->boolean('requires_president_approval')->default(false);
            $table->boolean('vice_president_approved')->default(false);
            $table->boolean('president_approved')->default(false);
            $table->timestamp('vice_president_approved_at')->nullable();
            $table->timestamp('president_approved_at')->nullable();
            $table->json('current_approvers')->nullable();
            $table->integer('current_approval_step')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
