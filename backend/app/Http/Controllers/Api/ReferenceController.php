<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReferenceController extends Controller
{
    private string $storagePath = 'reference_data.json';

    // The built-in default reference data.
    // This is the fallback when no custom data has been saved yet.
    private function defaults(): array
    {
        return [
            'ci_status' => [
                ['status_code' => 'Active',         'description' => 'CI is operational and in use',                           'allowed_in_production' => 'Yes',           'color_code' => 'Green'],
                ['status_code' => 'Decommissioned',  'description' => 'CI has been retired and removed from service',           'allowed_in_production' => 'No',            'color_code' => 'Gray'],
                ['status_code' => 'EOL',             'description' => 'CI has passed vendor End-of-Life date – immediate risk', 'allowed_in_production' => 'Risk managed',  'color_code' => 'Red'],
                ['status_code' => 'In Procurement',  'description' => 'CI ordered but not yet received',                       'allowed_in_production' => 'No',            'color_code' => 'Amber'],
                ['status_code' => 'In Deployment',   'description' => 'CI received and being configured',                      'allowed_in_production' => 'No',            'color_code' => 'Blue'],
                ['status_code' => 'Maintenance',     'description' => 'CI temporarily offline for planned maintenance',        'allowed_in_production' => 'Temporary',     'color_code' => 'Yellow'],
            ],
            'criticality_levels' => [
                ['criticality' => 'Critical', 'definition' => 'Failure causes immediate business stoppage or security breach', 'rto_target' => '≤ 1 hour',   'review_frequency' => 'Quarterly'],
                ['criticality' => 'High',     'definition' => 'Failure causes significant business impact within hours',      'rto_target' => '≤ 4 hours',  'review_frequency' => 'Semi-Annual'],
                ['criticality' => 'Medium',   'definition' => 'Failure causes moderate impact, workarounds available',        'rto_target' => '≤ 24 hours', 'review_frequency' => 'Annual'],
                ['criticality' => 'Low',      'definition' => 'Failure causes minimal impact',                                'rto_target' => '≤ 72 hours', 'review_frequency' => 'Annual'],
            ],
            'environments' => [
                ['environment' => 'Production',    'description' => 'Live business environment',                    'live_data_allowed' => 'Yes',              'change_approval_required' => 'Yes – CAB'],
                ['environment' => 'Staging',       'description' => 'Pre-production testing – mirrors production',  'live_data_allowed' => 'No',               'change_approval_required' => 'Yes – Change Manager'],
                ['environment' => 'Testing / QA',  'description' => 'Functional and security testing',             'live_data_allowed' => 'No',               'change_approval_required' => 'IT Manager'],
                ['environment' => 'Development',   'description' => 'Active development environment',              'live_data_allowed' => 'No',               'change_approval_required' => 'Team Lead'],
                ['environment' => 'DR / Failover', 'description' => 'Disaster recovery standby environment',       'live_data_allowed' => 'Replication only', 'change_approval_required' => 'Yes – CAB'],
            ],
            'data_classifications' => [
                ['classification' => 'Public',       'description' => 'Non-sensitive, freely shareable information',     'encryption_required' => 'No',        'external_sharing' => 'Yes'],
                ['classification' => 'Internal',     'description' => 'For internal use only – not for external sharing','encryption_required' => 'Recommended','external_sharing' => 'No'],
                ['classification' => 'Confidential', 'description' => 'Sensitive business or personal data',             'encryption_required' => 'Yes',        'external_sharing' => 'Restricted / Approved only'],
                ['classification' => 'Restricted',   'description' => 'Highest sensitivity – regulatory or legal data',  'encryption_required' => 'Mandatory',  'external_sharing' => 'Never'],
            ],
            'relationship_types' => [
                ['relationship_type' => 'Runs On / Hosted By',  'description' => 'Software or service that runs on a hardware CI'],
                ['relationship_type' => 'Uses / Depends On',    'description' => 'CI that requires another CI to function'],
                ['relationship_type' => 'Hosts / Virtualizes',  'description' => 'Physical CI that hosts virtual CIs'],
                ['relationship_type' => 'Backed Up By',         'description' => 'CI whose data is backed up to another CI'],
                ['relationship_type' => 'Replicates To',        'description' => 'CI that replicates data to another CI'],
                ['relationship_type' => 'HA Pair',              'description' => 'Two CIs configured in High Availability mode'],
                ['relationship_type' => 'Protects / Fronts',    'description' => 'Security CI protecting another CI'],
                ['relationship_type' => 'Load Balances',        'description' => 'CI distributing traffic to multiple target CIs'],
                ['relationship_type' => 'Contains PII For',     'description' => 'CI that stores or processes data for another system'],
            ],
        ];
    }

    //Load persisted data from storage, falling back to defaults.
    private function load(): array
    {
        if (Storage::exists($this->storagePath)) {
            $json = Storage::get($this->storagePath);
            $data = json_decode($json, true);
            if (is_array($data)) {
                // Merge: persisted keys override defaults, new defaults fill any missing keys
                return array_merge($this->defaults(), $data);
            }
        }
        return $this->defaults();
    }

    /**
     * Persist data to storage.
     */
    private function save(array $data): void
    {
        Storage::put($this->storagePath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    // GET /api/reference
    // Return all reference tables.
    public function index()
    {
        try {
            return response()->json($this->load());
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //  PUT /api/reference/{table}
    //  Replace all rows for a given reference table.
    //  Allowed table keys:
    //  ci_status | criticality_levels | environments | data_classifications | relationship_types
    //  Body: { "rows": [ { ...row fields }, ... ] }
    public function update(Request $request, string $table)
    {
        try {
            $allowed = array_keys($this->defaults());

            if (!in_array($table, $allowed, true)) {
                return response()->json([
                    'message' => "Unknown reference table '{$table}'. Allowed: " . implode(', ', $allowed),
                ], 422);
            }

            $validated = $request->validate([
                'rows'   => 'required|array|min:1',
                'rows.*' => 'array',
            ]);

            $data          = $this->load();
            $data[$table]  = $validated['rows'];
            $this->save($data);

            return response()->json([
                'message' => "Reference table '{$table}' updated successfully.",
                'data'    => $data[$table],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //POST /api/reference/{table}/rows
    //Append a single row to a reference table.
    //Body: { ...row fields }
    public function addRow(Request $request, string $table)
    {
        try {
            $allowed = array_keys($this->defaults());

            if (!in_array($table, $allowed, true)) {
                return response()->json(['message' => "Unknown reference table '{$table}'."], 422);
            }

            $data           = $this->load();
            $data[$table][] = $request->all();
            $this->save($data);

            return response()->json([
                'message' => 'Row added successfully.',
                'data'    => $data[$table],
            ], 201);

        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //DELETE /api/reference/{table}/rows/{index}
    //Remove a row by its 0-based index.
    public function deleteRow(string $table, int $index)
    {
        try {
            $allowed = array_keys($this->defaults());

            if (!in_array($table, $allowed, true)) {
                return response()->json(['message' => "Unknown reference table '{$table}'."], 422);
            }

            $data = $this->load();

            if (!isset($data[$table][$index])) {
                return response()->json(['message' => 'Row not found.'], 404);
            }

            array_splice($data[$table], $index, 1);
            $this->save($data);

            return response()->json([
                'message' => 'Row deleted successfully.',
                'data'    => $data[$table],
            ]);

        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // DELETE /api/reference/{table}/reset
    //Reset a table to its built-in defaults.
    public function resetTable(string $table)
    {
        try {
            $defaults = $this->defaults();

            if (!array_key_exists($table, $defaults)) {
                return response()->json(['message' => "Unknown reference table '{$table}'."], 422);
            }

            $data          = $this->load();
            $data[$table]  = $defaults[$table];
            $this->save($data);

            return response()->json([
                'message' => "Table '{$table}' has been reset to defaults.",
                'data'    => $data[$table],
            ]);

        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}