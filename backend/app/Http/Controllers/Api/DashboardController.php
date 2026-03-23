<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Models\NetworkDevice;
use App\Models\Endpoint;
use App\Models\Software;
use App\Models\CloudService;
use App\Models\CmdbDatabase;
use App\Models\CiRelationship;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
 
class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // ── 1. CIs per Category ───────────────────────────────────────────────
        $ciPerCategory = [
            ['category' => 'Server',         'total' => Server::count()],
            ['category' => 'Network Device', 'total' => NetworkDevice::count()],
            ['category' => 'Endpoint',       'total' => Endpoint::count()],
            ['category' => 'Software',       'total' => Software::count()],
            ['category' => 'Cloud Service',  'total' => CloudService::count()],
            ['category' => 'Database',       'total' => CmdbDatabase::count()],
            ['category' => 'Server',
                'total'          => Server::count(),
                'active'         => Server::where('status', 'Active')->count(),
                'decommissioned' => Server::where('status', 'Decommissioned')->count(),
                'eol'            => Server::where('status', 'EOL')->count(),
            ],
            ['category' => 'Network Device',
                'total'          => NetworkDevice::count(),
                'active'         => NetworkDevice::where('status', 'Active')->count(),
                'decommissioned' => NetworkDevice::where('status', 'Decommissioned')->count(),
                'eol'            => NetworkDevice::where('status', 'EOL')->count(),
            ],
            ['category' => 'Endpoint',
                'total'          => Endpoint::count(),
                'active'         => Endpoint::where('status', 'Active')->count(),
                'decommissioned' => Endpoint::where('status', 'Decommissioned')->count(),
                'eol'            => Endpoint::where('status', 'EOL')->count(),
            ],
            ['category' => 'Software',
                'total'          => Software::count(),
                'active'         => Software::where('status', 'Active')->count(),
                'decommissioned' => Software::where('status', 'Decommissioned')->count(),
                'eol'            => Software::where('status', 'EOL')->count(),
            ],
            ['category' => 'Cloud Service',
                'total'          => CloudService::count(),
                'active'         => CloudService::where('status', 'Active')->count(),
                'decommissioned' => CloudService::where('status', 'Decommissioned')->count(),
                'eol'            => CloudService::where('status', 'EOL')->count(),
            ],
            ['category' => 'Database',
                'total'          => CmdbDatabase::count(),
                'active'         => CmdbDatabase::where('status', 'Active')->count(),
                'decommissioned' => CmdbDatabase::where('status', 'Decommissioned')->count(),
                'eol'            => CmdbDatabase::where('status', 'EOL')->count(),
            ],
        ];
 
        $totalCIs = array_sum(array_column($ciPerCategory, 'total'));
 
        // ── 2. CIs per Status ────────────────────────────────────────────────
        // All 6 CI tables have a 'status' column
        $statusCounts = $this->aggregateByField([
            Server::class,
            NetworkDevice::class,
            Endpoint::class,
            Software::class,
            CloudService::class,
            CmdbDatabase::class,
        ], 'status');
 
        // ── 3. CIs per Criticality ────────────────────────────────────────────
        // Endpoint has NO criticality column — excluded
        // CloudService HAS criticality — included
        $criticalityCounts = $this->aggregateByField([
            Server::class,
            NetworkDevice::class,
            Software::class,
            CloudService::class,
            CmdbDatabase::class,
        ], 'criticality');
 
        // ── 4. CIs per Environment ────────────────────────────────────────────
        // CloudService has NO environment column — excluded
        $environmentCounts = $this->aggregateByField([
            Server::class,
            NetworkDevice::class,
            Endpoint::class,
            Software::class,
            CmdbDatabase::class,
        ], 'environment');
 
        // ── 5. CIs per Classification ─────────────────────────────────────────
        // Only Software, CloudService, and Database have data_classification
        $classificationCounts = $this->aggregateByField([
            Software::class,
            CloudService::class,
            CmdbDatabase::class,
        ], 'data_classification');
 
        // ── 6. Relationships per Type ─────────────────────────────────────────
        $relationshipCounts = CiRelationship::query()
            ->select('relationship_type', DB::raw('COUNT(*) as total'))
            ->groupBy('relationship_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn($row) => [
                'relationship_type' => $row->relationship_type ?? 'Unspecified',
                'total'             => (int) $row->total,
            ])
            ->values()
            ->toArray();
 
        // ── Response ──────────────────────────────────────────────────────────
        return response()->json([
            'success' => true,
            'data'    => [
                'total_cis'              => $totalCIs,
                'ci_per_category'        => $ciPerCategory,
                'ci_per_status'          => $statusCounts,
                'ci_per_criticality'     => $criticalityCounts,
                'ci_per_environment'     => $environmentCounts,
                'ci_per_classification'  => $classificationCounts,
                'relationships_per_type' => $relationshipCounts,
            ],
        ]);
    }
 
    /**
     * Aggregate counts for a given column across multiple Eloquent model classes,
     * merge the results, and return an array sorted by count descending.
     *
     * @param  array<int, class-string>  $models   List of model class strings
     * @param  string                    $column   The DB column to group by
     * @return array<int, array{label: string, total: int}>
     */
    private function aggregateByField(array $models, string $column): array
    {
        $merged = [];
 
        foreach ($models as $modelClass) {
            $rows = $modelClass::query()
                ->select($column, DB::raw('COUNT(*) as cnt'))
                ->whereNotNull($column)
                ->where($column, '!=', '')
                ->groupBy($column)
                ->get();
 
            foreach ($rows as $row) {
                $key           = $row->$column;
                $merged[$key]  = ($merged[$key] ?? 0) + (int) $row->cnt;
            }
        }
 
        arsort($merged);
 
        return array_values(
            array_map(
                fn($label, $total) => ['label' => $label, 'total' => $total],
                array_keys($merged),
                array_values($merged)
            )
        );
    }
}