<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CloudService;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class CloudServiceController extends Controller
{
    private function generateCiId(): string
    {
        $last = CloudService::withTrashed()
            ->where('ci_id', 'like', 'CLD-%')
            ->orderByRaw('TRY_CAST(SUBSTRING(ci_id, 5, LEN(ci_id)) AS INT) DESC')
            ->value('ci_id');

        if (!$last) return 'CLD-001';

        $number = (int) substr($last, 4);
        return 'CLD-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }

    //Display a listing of the resource.
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? CloudService::onlyTrashed()
                : CloudService::query();
            //search
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('ci_id', 'like', "%{$s}%")
                    ->orWhere('service_name', 'like', "%{$s}%")
                    ->orWhere('service_type', 'like', "%{$s}%")
                    ->orWhere('status', 'like', "%{$s}%");
                });
            }


            //filter
            if ($request->filled('status')) $query->where('status', $request->status);
            if ($request->filled('environment')) $query->where('environment', $request->environment);
            if ($request->filled('criticality')) $query->where('criticality', $request->criticality);
            
            //sort
            $sortBy = $request->get('sort_by', 'ci_id');
            $sortDir = $request->get('sort_dir', 'asc');
            $query->orderBy($sortBy, $sortDir);

            return response()->json($query->paginate($request->get('per_page', 25)));

        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
        
    }

    //Store a newly created resource in storage.
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'service_name'                     => 'required|string|max:255',
                'status'                           => 'nullable|string',
                'service_type'                     => 'nullable|string',
                'cloud_model'                      => 'nullable|string',
                'provider'                         => 'nullable|string',
                'region_data_recidency'            => 'nullable|string',
                'service_tier'                     => 'nullable|string',
                'account_subscription_id'          => 'nullable|string',
                'criticality'                      => 'nullable|string',
                'data_classification'              => 'nullable|string',
                'monthly_cost'                     => 'nullable|numeric|min:0',
                'sla_uptime'                       => 'nullable|numeric|min:0|max:100',
                //'monthly_cost'                     => 'nullable|decimal:15,2',
                //'sla_uptime'                       => 'nullable|decimal:5,2',
                'mfa_enforced'                     => 'boolean',
                'sso_integrated'                   => 'boolean',
                'encryption_at_rest'               => 'boolean',
                'encryption_in_transit'            => 'boolean',
                'dlp_monitored'                    => 'boolean',
                'logging_to_siem'                  => 'boolean',
                'soc_2_certified'                  => 'boolean',
                'contact_expiry'                   => 'nullable|date',
                'shared_responsibility_documented' => 'boolean',
                'business_owner'                   => 'nullable|string',
                'it_owner'                         => 'nullable|string',
                'last_security_review'             => 'nullable|date',
                'notes'                            => 'nullable|string',
            ]);

            $data['ci_id'] = $this->generateCiId();

            return response()->json(CloudService::create($data), 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Display the specified resource.
    public function show(CloudService $cloudService)
    {
        try {
            return response()->json($cloudService);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Update the specified resource in storage.
    public function update(Request $request, CloudService $cloudService)
    {
        try {
            $data = $request->validate([
                'service_name'                     => 'sometimes|required|string|max:255',
                'status'                           => 'nullable|string',
                'service_type'                     => 'nullable|string',
                'cloud_model'                      => 'nullable|string',
                'provider'                         => 'nullable|string',
                'region_data_recidency'            => 'nullable|string',
                'service_tier'                     => 'nullable|string',
                'account_subscription_id'          => 'nullable|string',
                'criticality'                      => 'nullable|string',
                'data_classification'              => 'nullable|string',
                'monthly_cost'                     => 'nullable|numeric|min:0',
                'sla_uptime'                       => 'nullable|numeric|min:0|max:100',
                //'monthly_cost'                     => 'nullable|decimal:15,2',
                //'sla_uptime'                       => 'nullable|decimal:5,2',
                'mfa_enforced'                     => 'boolean',
                'sso_integrated'                   => 'boolean',
                'encryption_at_rest'               => 'boolean',
                'encryption_in_transit'            => 'boolean',
                'dlp_monitored'                    => 'boolean',
                'logging_to_siem'                  => 'boolean',
                'soc_2_certified'                  => 'boolean',
                'contact_expiry'                   => 'nullable|date',
                'shared_responsibility_documented' => 'boolean',
                'business_owner'                   => 'nullable|string',
                'it_owner'                         => 'nullable|string',
                'last_security_review'             => 'nullable|date',
                'notes'                            => 'nullable|string',
            ]);

            $cloudService->update($data);
            return response()->json($cloudService);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }

    }

    //Remove the specified resource from storage.
    public function destroy(CloudService $cloudService)
    {
        try {
            $cloudService->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function restore(string $ciId)
    {
        try {
            $cloudService = CloudService::withTrashed()->where('ci_id', $ciId)->firstOrFail();
            $cloudService->restore();
            return response()->json($cloudService);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Cloud service not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function forceDelete(string $ciId)
    {
        try {
            CloudService::withTrashed()->where('ci_id', $ciId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Cloud service not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}
