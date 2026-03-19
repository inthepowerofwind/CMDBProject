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
        Schema::create('ci_change_logs', function (Blueprint $table) {
            $table->id();
            $table->string('change_log_id', 50)->unique();
            $table->string('ci_id',50);
            $table->string('ci_name');
            $table->string('ci_table');
            $table->string('change_type');
            $table->text('change_description')->nullable();
            $table->string('change_by')->nullable();
            $table->string('rfs_reference')->nullable();
            $table->string('approved_by')->nullable();  
            $table->json('previous_values')->nullable();
            $table->json('new_values')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ci_change_logs');
    }
};
