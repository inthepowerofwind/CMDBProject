<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Software extends Model
{
    use SoftDeletes;

   // hides the internal auto-increment id; ci_id is used as the public identifier
    protected $hidden = ['id'];

   // uses ci_id as the route model binding key instead of the default id
    public function getRouteKeyName(): string { return 'ci_id'; }

    protected $fillable = [

        'ci_id',
        'software_name',
        'status',
        'software_type',
        'version',
        'vendor',
        'license_type',
        'license_count',
        'licenses_deployed',
        'licenses_available',
        'compliance_status',
        'installed_on',
        'environment',
        'criticality',
        'data_classification',
        'auto_update',
        'asl_approved',
        'sast_dast_tested',
        'license_key_location',
        'procurement_date',
        'license_expiry',
        'eol_date',
        'last_review',
        'notes',
    ];
    
    protected $casts = [
        'auto_update' => 'boolean',
        'asl_approved' => 'boolean',
        'last_review' => 'date',
        'eol_date' => 'string',
    ];

}
