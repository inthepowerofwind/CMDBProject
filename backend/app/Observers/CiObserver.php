<?php

namespace App\Observers;

use App\Models\CiChangeLog;
use Illuminate\Database\Eloquent\Model;

class CiObserver
{
    //Handle events after all transactions are committed.
    public $afterCommit = true;

    private array $excludedFields = [
        'id', 'created_at', 'updated_at', 'deleted_at',
    ];

    private array $fieldLabels = [

        // Common CI Fields
        'ci_id'                             => 'CI ID',
        'ci_name'                           => 'CI Name',
        'ci_type'                           => 'CI Type',
        'status'                            => 'Status',
        'criticality'                       => 'Criticality',
        'notes'                             => 'Notes',
        'environment'                       => 'Environment',
        'department'                        => 'Department',

        // Ownership
        'assigned_owner'                    => 'Assigned Owner',
        'assigned_user'                     => 'Assigned User',
        'business_owner'                    => 'Business Owner',
        'it_owner'                          => 'IT Owner',
        'employee_id'                       => 'Employee ID',

        // Infrastructure / Server
        'hostname'                          => 'Hostname',
        'ip_address'                        => 'IP Address',
        'operating_system'                  => 'Operating System',
        'os_version'                        => 'OS Version',
        'patch_level'                       => 'Patch Level',
        'cpu'                               => 'CPU',
        'cpu_cores'                         => 'CPU Cores',
        'ram_gb'                            => 'RAM (GB)',
        'storage_gb'                        => 'Storage (GB)',
        'storage_tb'                        => 'Storage (TB)',
        'virtualized'                       => 'Virtualized',

        // Hardware / Asset
        'manufacturer'                      => 'Manufacturer',
        'model'                             => 'Model',
        'serial_number'                     => 'Serial Number',
        'asset_tag'                         => 'Asset Tag',
        'purchase_date'                     => 'Purchase Date',
        'warranty_expiry'                   => 'Warranty Expiry',
        'eol_date'                          => 'EOL Date',

        // Location
        'location'                          => 'Location',
        'location_floor'                    => 'Location/Floor',
        'rack_slot'                         => 'Rack Slot',
        'rack_position'                     => 'Rack Position',

        // Network
        'mac_address'                       => 'MAC Address',
        'vlan_segment'                      => 'VLAN/Segment',
        'ports_interfaces'                  => 'Ports/Interfaces',

        // Security & Monitoring
        'baseline_applied'                  => 'Baseline Applied',
        'backup_enabled'                    => 'Backup Enabled',
        'monitoring_siem'                   => 'SIEM Monitoring',
        'encryption'                        => 'Encryption',
        'mdm_enrolled'                      => 'MDM Enrolled',
        'edr_agent'                         => 'EDR Agent',
        'antivirus'                         => 'Antivirus',
        'last_login'                        => 'Last Login',

        // Cloud Services
        'service_name'                      => 'Service Name',
        'service_type'                      => 'Service Type',
        'cloud_model'                       => 'Cloud Model',
        'provider'                          => 'Provider',
        'region_data_recidency'             => 'Region/Data Residency',
        'service_tier'                      => 'Service Tier',
        'account_subscription_id'           => 'Subscription ID',
        'data_classification'               => 'Data Classification',
        'monthly_cost'                      => 'Monthly Cost',
        'sla_uptime'                        => 'SLA Uptime',
        'mfa_enforced'                      => 'MFA Enforced',
        'sso_integrated'                    => 'SSO Integrated',
        'encryption_at_rest'                => 'Encryption at Rest',
        'encryption_in_transit'             => 'Encryption in Transit',
        'dlp_monitored'                     => 'DLP Monitored',
        'logging_to_siem'                   => 'Logging to SIEM',
        'soc_2_certified'                   => 'SOC 2 Certified',
        'contact_expiry'                    => 'Contact Expiry',
        'shared_responsibility_documented'  => 'Shared Responsibility Documented',
        'last_security_review'              => 'Last Security Review',

        // Software
        'software_name'                     => 'Software Name',
        'software_type'                     => 'Software Type',
        'version'                           => 'Version',
        'vendor'                            => 'Vendor',
        'license_type'                      => 'License Type',
        'license_count'                     => 'License Count',
        'licenses_deployed'                 => 'Licenses Deployed',
        'licenses_available'                => 'Licenses Available',
        'compliance_status'                 => 'Compliance Status',
        'installed_on'                      => 'Installed On',
        'auto_update'                       => 'Auto Update',
        'asl_approved'                      => 'ASL Approved',
        'sast_dast_tested'                  => 'SAST/DAST Tested',
        'license_key_location'              => 'License Key Location',
        'procurement_date'                  => 'Procurement Date',
        'license_expiry'                    => 'License Expiry',
        'last_review'                       => 'Last Review',

        // Database
        'database_name'                     => 'Database Name',
        'db_type'                           => 'DB Type',
        'host_server_ci'                    => 'Host Server CI',
        'port'                              => 'Port',
        'size_gb'                           => 'Size (GB)',
        'backup_frequency'                  => 'Backup Frequency',
        'last_backup'                       => 'Last Backup',
        'tde_enabled'                       => 'TDE Enabled',
        'access_control'                    => 'Access Control',
        'monitoring'                        => 'Monitoring',
        'db_owner'                          => 'DB Owner',

        // Relationships
        'relationship_id'                   => 'Relationship ID',
        'source_ci_id'                      => 'Source CI',
        'target_ci_id'                      => 'Target CI',
        'relationship_type'                 => 'Relationship Type',
        'description'                       => 'Description',
        'bussiness_application'             => 'Business Application',
    ];

    private array $changeTypeHints = [

        // Updates
        'patch_level'                       => 'Patch Update',
        'firmware_version'                  => 'Firmware Update',
        'version'                           => 'Version Update',
        'os_version'                        => 'OS Update',
        'operating_system'                  => 'OS Update',

        // Changes
        'status'                            => 'Status Change',
        'criticality'                       => 'Criticality Change',
        'data_classification'               => 'Classification Change',
        'environment'                       => 'Environment Change',
        'location'                          => 'Location Change',
        'service_tier'                      => 'Tier Change',

        // Ownership
        'assigned_owner'                    => 'Ownership Change',
        'assigned_user'                     => 'Ownership Change',
        'business_owner'                    => 'Ownership Change',
        'it_owner'                          => 'Ownership Change',

        // Financial / License
        'monthly_cost'                      => 'Cost Update',
        'license_count'                     => 'License Update',
        'licenses_deployed'                 => 'License Update',
        'license_expiry'                    => 'License Update',
        'compliance_status'                 => 'Compliance Update',

        // SLA / Reviews
        'sla_uptime'                        => 'SLA Update',
        'last_security_review'              => 'Security Review Update',
        'last_config_review'                => 'Config Review Update',
        'warranty_expiry'                   => 'Warranty Update',
        'eol_date'                          => 'EOL Update',

        // Rename
        'ci_name'                           => 'Rename',
        'service_name'                      => 'Rename',
        'software_name'                     => 'Rename',
        'database_name'                     => 'Rename',
        'hostname'                          => 'Rename',
    ];
    

    private function formatValue(mixed $value): string
    {
        if (is_null($value))                                    return 'null';
        if ($value === true  || $value === 1 || $value === '1') return 'Yes';
        if ($value === false || $value === 0 || $value === '0') return 'No';
        if (is_array($value))                                   return json_encode($value);
        $str = (string) $value;
        if (preg_match('/^(\d{4}-\d{2}-\d{2})T00:00:00/', $str, $m)) {
            return $m[1];
        }
        return $str;
    }

    private function label(string $field): string
    {
        return $this->fieldLabels[$field]
            ?? ucwords(str_replace('_', ' ', $field));
    }

    private function buildSummary(array $fields): array
    {
        $summary = [];
        foreach ($fields as $key => $value) {
            if (in_array($key, $this->excludedFields, true)) continue;
            $summary[$this->label($key)] = $this->formatValue($value);
        }
        return $summary;
    }

    private function buildChangedSummaries(array $prev, array $next): array
    {
        $prevSummary = [];
        $nextSummary = [];
        foreach ($next as $key => $newVal) {
            if (in_array($key, $this->excludedFields, true)) continue;
            $label               = $this->label($key);
            $nextSummary[$label] = $this->formatValue($newVal);
            $prevSummary[$label] = $this->formatValue($prev[$key] ?? null);
        }
        return [$prevSummary, $nextSummary];
    }

    private function resolveChangeType(array $changedFields): string
    {
        $matched = [];

        foreach ($this->changeTypeHints as $field => $label) {
            if (array_key_exists($field, $changedFields) && !in_array($label, $matched, true)) {
                $matched[] = $label;
            }
        }

        return !empty($matched) ? implode(', ', $matched) : 'Updated';
    }

    private function buildDescription(string $type, string $table, array $changedFields = []): string
    {
        if ($type === 'Created')  return "New CI record created in {$table}";
        if ($type === 'Deleted')  return "CI record removed from {$table}";
        if ($type === 'Restored') return "CI record restored in {$table}";
        if (!empty($changedFields)) {
            $labels  = array_map(fn ($f) => $this->label($f), array_keys($changedFields));
            $visible = array_slice($labels, 0, 4);
            $extra   = count($labels) > 4 ? ' and ' . (count($labels) - 4) . ' more' : '';
            return 'Updated ' . implode(', ', $visible) . $extra . " on {$table}";
        }
        return "Updated record on {$table}";
    }

    private function log(Model $model, string $type, array $prev = [], array $next = []): void
    {
        $ciId = $next['ci_id']
                ?? $next['relationship_id']
                ?? $prev['ci_id']
                ?? $prev['relationship_id']
                ?? $model->ci_id
                ?? $model->relationship_id
                ?? (string) $model->id;

        $ciName = $next['ci_name']
                  ?? $next['service_name']
                  ?? $next['software_name']
                  ?? $next['database_name']
                  ?? $prev['ci_name']
                  ?? $model->ci_name
                  ?? $model->service_name
                  ?? $model->software_name
                  ?? $model->database_name
                  ?? 'Unknown';

        $table = $model->getTable();

        if ($type === 'Updated') {
            [$prevSummary, $nextSummary] = $this->buildChangedSummaries($prev, $next);
            $changeType  = $this->resolveChangeType($next);
            $description = $this->buildDescription($type, $table, $next);
        } elseif ($type === 'Deleted') {
            $prevSummary = $this->buildSummary($prev);
            $nextSummary = [];
            $changeType  = 'Deleted';
            $description = $this->buildDescription($type, $table);
        } elseif ($type === 'Restored') {
            $prevSummary = [];
            $nextSummary = $this->buildSummary($next);
            $changeType  = 'Restored';
            $description = $this->buildDescription($type, $table);
        } else {
            $prevSummary = [];
            $nextSummary = $this->buildSummary($next);
            $changeType  = 'Created';
            $description = $this->buildDescription($type, $table);
        }

        CiChangeLog::create([
            'change_log_id'      => CiChangeLog::generateChangeLogId(),
            'ci_id'              => $ciId,
            'ci_name'            => $ciName,
            'ci_table'           => $table,
            'change_type'        => $changeType,
            'change_description' => $description,
            'change_by' => optional(request()->user())->name ?? 'System',
            'previous_values'    => $prevSummary ?: null,
            'new_values'         => $nextSummary ?: null,
        ]);
    }

    public function created(Model $m): void
    {
        //dd($m->toArray());
        $this->log($m, 'Created', [], $m->toArray());
    }

    public function updated(Model $m): void
    {
        $this->log($m, 'Updated', $m->getOriginal(), $m->getChanges());
    }

    public function deleted(Model $m): void
    {
        $this->log($m, 'Deleted', $m->toArray());
    }

    public function restored(Model $m): void
    {
        $this->log($m, 'Restored', [], $m->toArray());
    }

    
}