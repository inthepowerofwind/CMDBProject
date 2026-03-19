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
        Schema::create('network_devices', function (Blueprint $table) {
            $table->id();
            $table->string('ci_id', 50)->unique();
            $table->string('ci_name');
            $table->string('status')->default('Active');
            $table->string('ci_type')->nullable();
            $table->string('environment')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('mac_address')->nullable();
            $table->string('vlan_segment')->nullable();
            $table->string('ports_interfaces')->nullable();
            $table->string('firmware_version')->nullable(); 
            $table->string('patch_level')->nullable();
            $table->string('location')->nullable();
            $table->string('rack_position')->nullable();
            $table->string('criticality')->nullable();
            $table->string('business_service')->nullable();
            $table->string('redundancy_ha')->nullable();
            $table->string('assigned_owner')->nullable();
            $table->string('department')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('model')->nullable();
            $table->string('serial_number')->nullable();
            $table->string('asset_tag')->nullable();
            $table->date('purchase_date')->nullable();
            $table->date('warranty_expiry')->nullable();
            $table->date('eol_date')->nullable();
            $table->date('last_config_review')->nullable();
            $table->boolean('baseline_applied')->default(true);
            $table->boolean('monitoring_siem')->default(true);
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
        Schema::dropIfExists('network_devices');
    }
};
