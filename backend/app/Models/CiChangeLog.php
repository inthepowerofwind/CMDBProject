<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CiChangeLog extends Model
{
    use SoftDeletes;
    protected $hidden = ['id'];
    public function getRouteKeyName(): string { return 'change_log_id'; }
    protected $fillable = [
        'change_log_id',
        'ci_id',
        'ci_name',
        'ci_table',
        'change_type',
        'change_description',
        'change_by',
        'rfs_reference',
        'approved_by',
        'previous_values',
        'new_values',
    ];

    protected $casts = [
        'previous_values' => 'array',
        'new_values'      => 'array',
    ];
    
    
}
