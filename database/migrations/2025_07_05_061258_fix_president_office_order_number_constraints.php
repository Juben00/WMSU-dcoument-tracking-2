<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Drop the old unique constraint if it exists
        try {
            DB::statement("ALTER TABLE documents DROP INDEX documents_department_order_unique");
        } catch (\Exception $e) {
            // Ignore if it doesn't exist
        }

        // Add the new unique constraint for all departments: department_id + document_type + order_number
        Schema::table('documents', function (Blueprint $table) {
            $table->unique(['department_id', 'document_type', 'order_number'], 'documents_dept_type_order_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the new unique constraint
        Schema::table('documents', function (Blueprint $table) {
            $table->dropUnique('documents_dept_type_order_unique');
        });

        // Restore the old unique constraint
        Schema::table('documents', function (Blueprint $table) {
            $table->unique(['department_id', 'order_number'], 'documents_department_order_unique');
        });
    }
};
