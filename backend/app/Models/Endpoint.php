<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Endpoint extends Model
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
        'ip_address',
        'operating_system',
        'os_version',
        'patch_level',
        'assigned_user',
        'employee_id',
        'department',
        'location_floor',
        'manufacturer',
        'model',
        'serial_number',
        'asset_tag',
        'cpu',
        'ram_gb',
        'storage_gb',
        'encryption',
        'mdm_enrolled',
        'edr_agent',
        'antivirus',
        'last_login',
        'purchase_date',
        'warranty_expiry',
        'eol_date',
        'notes',
    ];
    protected $casts = [
        'ram_gb' => 'integer',
        'storage_gb' => 'integer',
        'mdm_enrolled' => 'boolean',
        'edr_agent'=> 'boolean',
        'antivirus'=> 'boolean',
        'purchase_date'=> 'date',
        'last_login'=> 'date',
        'warranty_expiry'=> 'date',
        'eol_date'=> 'date',
    ];
}
