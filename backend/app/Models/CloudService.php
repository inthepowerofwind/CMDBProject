<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class CloudService extends Model
{
    use SoftDeletes;

    // hides the internal auto-increment id; ci_id is used as the public identifier
    protected $hidden = ['id'];

    // uses ci_id as the route model binding key instead of the default id
    public function getRouteKeyName(): string { return 'ci_id'; }

    // formats monthly_cost with a $ prefix on read and strips non-numeric characters on write
    protected function monthlyCost(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value !== null ? '$' . number_format($value, 2) : null,
            set: fn ($value) => is_string($value)
                ? preg_replace('/[^0-9.]/', '', $value)
                : $value,
        );
    }

    // formats sla_uptime with a % suffix on read and strips non-numeric characters on write
    protected function slaUptime(): Attribute
    {
        return Attribute::make(
            get: fn ($value) => $value !== null ? $value . '%' : null,
            set: fn ($value) => is_string($value)
                ? preg_replace('/[^0-9.]/', '', $value)
                : $value,
        );
    }

    protected $fillable = [
        'ci_id',
        'service_name',
        'status',
        'service_type',
        'cloud_model',
        'provider',
        'region_data_recidency',
        'service_tier',
        'account_subscription_id',
        'criticality',
        'data_classification',
        'monthly_cost',
        'sla_uptime',
        'mfa_enforced',
        'sso_integrated',
        'encryption_at_rest',
        'encryption_in_transit',
        'dlp_monitored',
        'logging_to_siem',
        'soc_2_certified',
        'contract_expiry',
        'shared_responsibility_documented',
        'business_owner',
        'it_owner',
        'last_security_review',
        'notes',
    ];

    protected $casts = [
        'mfa_enforced'                     => 'boolean',
        'sso_integrated'                   => 'boolean',
        'encryption_at_rest'               => 'boolean',
        'encryption_in_transit'            => 'boolean',
        'dlp_monitored'                    => 'boolean',
        'logging_to_siem'                  => 'boolean',
        'soc_2_certified'                  => 'boolean',
        'shared_responsibility_documented' => 'boolean',
        'contract_expiry'                  => 'date',
        'last_security_review'             => 'date',
    ];
}
