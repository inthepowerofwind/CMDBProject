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
        Schema::create('cloud_services', function (Blueprint $table) {
            $table->id();
            $table->string('ci_id', 50)->unique();
            $table->string('service_name');
            $table->string('status')->default('Active');
            $table->string('service_type')->nullable();
            $table->string('cloud_model')->nullable();
            $table->string('provider')->nullable();
            $table->string('region_data_recidency')->nullable();
            $table->string('service_tier')->nullable();
            $table->string('account_subscription_id')->nullable();
            $table->string('criticality')->nullable();
            $table->string('data_classification')->nullable();
            $table->decimal('monthly_cost', 15, 2)->nullable();
            $table->decimal('sla_uptime', 5, 2)->nullable();
            $table->boolean('mfa_enforced')->default(true);
            $table->boolean('sso_integrated')->default(true);
            $table->boolean('encryption_at_rest')->default(true);
            $table->boolean('encryption_in_transit')->default(true);
            $table->boolean('dlp_monitored')->default(true);
            $table->boolean('logging_to_siem')->default(true);
            $table->boolean('soc_2_certified')->default(true);
            $table->date('contact_expiry')->nullable();
            $table->boolean('shared_responsibility_documented')->default(true);
            $table->string('business_owner')->nullable();
            $table->string('it_owner')->nullable();
            $table->date('last_security_review')->nullable();
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
        Schema::dropIfExists('cloud_services');
    }
};
