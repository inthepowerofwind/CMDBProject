<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Software;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class SoftwareController extends Controller
{
    private function generateCiId(): string
    {
        $last = Software::withTrashed()
            ->where('ci_id', 'like', 'SW-%')
            ->orderByRaw('TRY_CAST(SUBSTRING(ci_id, 4, LEN(ci_id)) AS INT) DESC')
            ->value('ci_id');

        if (!$last) return 'SW-001';

        $number = (int) substr($last, 3);
        return 'SW-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }
    //Display a listing of the resource.
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? Software::onlyTrashed()
                : Software::query();
            //search
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('ci_id', 'like', "%{$s}%")
                    ->orWhere('software_name', 'like', "%{$s}%")
                    ->orWhere('software_type', 'like', "%{$s}%")
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
                'software_name'        => 'required|string|max:255',
                'status'               => 'nullable|string',
                'software_type'        => 'nullable|string',
                'version'              => 'nullable|string',
                'vendor'               => 'nullable|string',
                'license_type'         => 'nullable|string',
                'license_count'        => 'nullable|string',
                'licenses_deployed'    => 'nullable|string',
                'licenses_available'   => 'nullable|string',
                'compliance_status'    => 'nullable|string',
                'installed_on'         => 'nullable|string',
                'environment'          => 'nullable|string',
                'criticality'          => 'nullable|string',
                'data_classification'  => 'nullable|string',
                'auto_update'          => 'boolean',
                'asl_approved'         => 'boolean',
                'sast_dast_tested'     => 'boolean',
                'license_key_location' => 'nullable|string',
                'procurement_date'     => 'nullable|string',
                'license_expiry'       => 'nullable|string',
                'eol_date'             => 'nullable|date',
                'last_review'          => 'nullable|date',
                'notes'                => 'nullable|string',
                 // Add validation rules for other fields as needed
            ]);
            $data['ci_id'] = $this->generateCiId();

            return response()->json(Software::create($data), 201);
                } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Display the specified resource.
    public function show(Software $software)
    {
        try {
            return response()->json($software);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Update the specified resource in storage.
    public function update(Request $request, Software $software)
    {
        try {
            $data = $request->validate([
                'software_name'        => 'sometimes|required|string|max:255',
                'status'               => 'nullable|string',
                'software_type'        => 'nullable|string',
                'version'              => 'nullable|string',
                'vendor'               => 'nullable|string',
                'license_type'         => 'nullable|string',
                'license_count'        => 'nullable|string',
                'licenses_deployed'    => 'nullable|string',
                'licenses_available'   => 'nullable|string',
                'compliance_status'    => 'nullable|string',
                'installed_on'         => 'nullable|string',
                'environment'          => 'nullable|string',
                'criticality'          => 'nullable|string',
                'data_classification'  => 'nullable|string',
                'auto_update'          => 'boolean',
                'asl_approved'         => 'boolean',
                'sast_dast_tested'     => 'boolean',
                'license_key_location' => 'nullable|string',
                'procurement_date'     => 'nullable|string',
                'license_expiry'       => 'nullable|string',
                'eol_date'             => 'nullable|date',
                'last_review'          => 'nullable|date',
                'notes'                => 'nullable|string',
                // Add validation rules for other fields as needed
            ]);

            $software->update($data);
            return response()->json($software);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Remove the specified resource from storage.
    public function destroy(Software $software)
    {
        try {
            $software->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function restore(string $ciId)
    {
        try {
            $software = Software::withTrashed()->where('ci_id', $ciId)->firstOrFail();
            $software->restore();
            return response()->json($software);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Software not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function forceDelete(string $ciId)
    {
        try {
            Software::withTrashed()->where('ci_id', $ciId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Software not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}
