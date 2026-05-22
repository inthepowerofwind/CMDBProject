<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CmdbDatabase extends Model
{
    use SoftDeletes;

    protected $table = 'databases';

   // hides the internal auto-increment id; ci_id is used as the public identifier
    protected $hidden = ['id'];

   // uses ci_id as the route model binding key instead of the default id
    public function getRouteKeyName(): string { return 'ci_id'; }

    protected $fillable = [
        'ci_id',
        'database_name',
        'status',
        'db_type',
        'version',
        'environment',
        'host_server_ci',
        'ip_address',
        'port',
        'criticality',
        'data_classification',
        'size_gb',
        'backup_enabled',
        'backup_frequency',
        'last_backup',
        'encryption_at_rest',
        'tde_enabled',
        'access_control',
        'monitoring',
        'patch_level',
        'eol_date',
        'db_owner',
        'business_application',
        'last_review',
        'notes',
    ];

    protected $casts = [
        'size_gb' => 'integer',
        'backup_enabled' => 'boolean',
        'encryption_at_rest' => 'boolean',
        'tde_enabled' => 'boolean',
        'access_control' => 'boolean',
        'monitoring' => 'boolean',
        'eol_date' => 'string',
        'last_review' => 'date',
    ];
}
