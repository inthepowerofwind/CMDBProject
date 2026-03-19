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
        Schema::create('databases', function (Blueprint $table) {
            $table->id();
            $table->string('ci_id', 50)->unique();
            $table->string('database_name');
            $table->string('status')->default('Active');
            $table->string('db_type')->nullable();
            $table->string('version')->nullable();
            $table->string('environment')->nullable();
            $table->string('host_server_ci')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('port')->nullable();
            $table->string('criticality')->nullable();
            $table->string('data_classification')->nullable();
            $table->integer('size_gb')->nullable();
            $table->boolean('backup_enabled')->default(true);
            $table->string('backup_frequency')->nullable();
            $table->date('last_backup')->nullable();
            $table->boolean('encryption_at_rest')->default(true);
            $table->boolean('tde_enabled')->default(true);
            $table->boolean('access_control')->default(true);
            $table->boolean('monitoring')->default(true);
            $table->string('patch_level')->nullable();
            $table->date('eol_date')->nullable();
            $table->string('db_owner')->nullable();
            $table->string('bussiness_application')->nullable();
            $table->date('last_review')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('databases');
    }
};
