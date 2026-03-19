<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Server extends Model
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
        'hostname',
        'operating_system',
        'os_version',
        'patch_level',
        'cpu_cores',
        'ram_gb',
        'storage_tb',
        'virtualized',
        'location',
        'rack_slot',
        'criticality',
        'business_service',
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
        'backup_enabled',
        'monitoring_siem',
        'notes',
    ];
    protected $casts = [
        'virtualized' => 'boolean',
        'baseline_applied' => 'boolean',
        'backup_enabled'=> 'boolean',
        'monitoring_siem'=> 'boolean',
        'purchase_date'=> 'date',
        'warranty_expiry'=> 'date',
        'eol_date'=> 'date',
        'last_config_review'=> 'date',
    ];
}
