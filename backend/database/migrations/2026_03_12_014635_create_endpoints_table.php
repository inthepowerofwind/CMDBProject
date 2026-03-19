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
        Schema::create('endpoints', function (Blueprint $table) {
            $table->id();
            $table->string('ci_id', 50)->unique();
            $table->string('ci_name');
            $table->string('status')->default('Active');
            $table->string('ci_type')->nullable();
            $table->string('environment')->nullable();
            $table->string('hostname')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('operating_system')->nullable();
            $table->string('os_version')->nullable();
            $table->string('patch_level')->nullable();
            $table->string('assigned_user')->nullable();
            $table->string('employee_id')->nullable();
            $table->string('department')->nullable();
            $table->string('location_floor')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('asset_tag')->nullable();
            $table->string('cpu')->nullable();
            $table->integer('ram_gb')->nullable();
            $table->integer('storage_gb')->nullable();
            $table->string('encryption')->nullable();
            $table->boolean('mdm_enrolled')->default(true);
            $table->boolean('edr_agent')->default(true);
            $table->boolean('antivirus')->default(true);
            $table->date('last_login')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->date('eol_date')->nullable();
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
        Schema::dropIfExists('endpoints');
    }
};
