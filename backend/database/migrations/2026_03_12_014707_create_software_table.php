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
        Schema::create('software', function (Blueprint $table) {
            $table->id();
            $table->string('ci_id', 50)->unique();
            $table->string('software_name');
            $table->string('status')->default('Active');
            $table->string('software_type')->nullable();
            $table->string('version')->nullable();
            $table->string('vendor')->nullable();
            $table->string('license_type')->nullable();
            $table->string('license_count')->nullable();
            $table->string('licenses_deployed')->nullable();
            $table->string('licenses_available')->nullable();
            $table->string('compliance_status')->default('Compliant');
            $table->string('installed_on')->nullable();
            $table->string('environment')->nullable();
            $table->string('criticality')->nullable();
            $table->string('data_classification')->nullable();
            $table->boolean('auto_update')->default(true);
            $table->boolean('asl_approved')->default(true);
            $table->boolean('sast_dast_tested')->default(true);
            $table->string('license_key_location')->nullable();
            $table->string('procurement_date')->nullable();
            $table->string('license_expiry')->nullable();
            $table->date('eol_date')->nullable();
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
        Schema::dropIfExists('software');
    }
};
