<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class NetworkDevice extends Model
{
    use SoftDeletes;
    protected $hidden = ['id'];
    public function getRouteKeyName(): string { return 'ci_id'; }
    protected $fillable = [
        'ci_id',
        'ci_name',
        'status',
        'ci_type',
        'environment',
        'ip_address',
        'mac_address',
        'vlan_segment',
        'ports_interfaces',
        'firmware_version',
        'patch_level',
        'location',
        'rack_position',
        'criticality',
        'business_service',
        'redundancy_ha',
        'assigned_owner',
        'department',
        'manufacturer',
        'model',
        'serial_number',
        'asset_tag',
        'purchase_date',
        'warranty_expiry',
        'eol_date',
        'last_config_review',
        'baseline_applied',
        'monitoring_siem',
        'notes',
    ];
    protected $casts = [
        'baseline_applied' => 'boolean',
        'monitoring_siem'=> 'boolean',
        'purchase_date'=> 'date',
        'warranty_expiry'=> 'date',
        'eol_date'=> 'date',
        'last_config_review'=> 'date',
    ];
}
