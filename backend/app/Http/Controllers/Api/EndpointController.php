<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Endpoint;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class EndpointController extends Controller
{
    private function generateCiId(): string
    {
        $last = Endpoint::withTrashed()
            ->where('ci_id', 'like', 'EP-%')
            ->orderByRaw('TRY_CAST(SUBSTRING(ci_id, 4, LEN(ci_id)) AS INT) DESC')
            ->value('ci_id');

        if (!$last) return 'EP-001';

        $number = (int) substr($last, 3);
        return 'EP-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }

    //Display a listing of the resource.
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? Endpoint::onlyTrashed()
                : Endpoint::query();
            //search
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('ci_id', 'like', "%{$s}%")
                      ->orWhere('ci_name', 'like', "%{$s}%")
                      ->orWhere('operating_system', 'like', "%{$s}%")
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
                'ci_name'         => 'required|string|max:255',
                'status'          => 'nullable|string',
                'ci_type'         => 'nullable|string',
                'environment'     => 'nullable|string',
                'hostname'        => 'nullable|string',
                'ip_address'      => 'nullable|string',
                'operating_system'=> 'nullable|string',
                'os_version'      => 'nullable|string',
                'patch_level'     => 'nullable|string',
                'assigned_user'   => 'nullable|string',
                'employee_id'     => 'nullable|string',
                'department'      => 'nullable|string',
                'location_floor'  => 'nullable|string',
                'manufacturer'    => 'nullable|string',
                'model'           => 'nullable|string',
                'serial_number'   => 'nullable|string',
                'asset_tag'       => 'nullable|string',
                'cpu'             => 'nullable|string',
                'ram_gb'          => 'nullable|integer',
                'storage_gb'      => 'nullable|integer',
                'encryption'      => 'nullable|string',
                'mdm_enrolled'    => 'nullable|boolean',
                'edr_enrolled'    => 'nullable|boolean',
                'antivirus'       => 'nullable|boolean',
                'last_login'      => 'nullable|date',
                'purchase_date'   => 'nullable|date',
                'warranty_expiry' => 'nullable|date',
                'eol_date'        => 'nullable|date',
                'notes'           => 'nullable|string',
            ]);
            $data['ci_id'] = $this->generateCiId();

            return response()->json(Endpoint::create($data), 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Display the specified resource.
    public function show(Endpoint $endpoint)
    {
        try {
            return response()->json($endpoint);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Update the specified resource in storage.
    public function update(Request $request, Endpoint $endpoint)
    {
        try {
             $data = $request->validate([
                'ci_name'         => 'sometimes|required|string|max:255',
                'status'          => 'nullable|string',
                'ci_type'         => 'nullable|string',
                'environment'     => 'nullable|string',
                'hostname'        => 'nullable|string',
                'ip_address'      => 'nullable|string',
                'operating_system'=> 'nullable|string',
                'os_version'      => 'nullable|string',
                'patch_level'     => 'nullable|string',
                'assigned_user'   => 'nullable|string',
                'employee_id'     => 'nullable|string',
                'department'      => 'nullable|string',
                'location_floor'  => 'nullable|string',
                'manufacturer'    => 'nullable|string',
                'model'           => 'nullable|string',
                'serial_number'   => 'nullable|string',
                'asset_tag'       => 'nullable|string',
                'cpu'             => 'nullable|string',
                'ram_gb'          => 'nullable|integer',
                'storage_gb'      => 'nullable|integer',
                'encryption'      => 'nullable|string',
                'mdm_enrolled'    => 'nullable|boolean',
                'edr_enrolled'    => 'nullable|boolean',
                'antivirus'       => 'nullable|boolean',
                'last_login'      => 'nullable|date',
                'purchase_date'   => 'nullable|date',
                'warranty_expiry' => 'nullable|date',
                'eol_date'        => 'nullable|date',
                'notes'           => 'nullable|string',
            ]);

            $endpoint->update($data);
            return response()->json($endpoint);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Remove the specified resource from storage.
    public function destroy(Endpoint $endpoint)
    {
        try {
            $endpoint->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function restore(string $ciId)
    {
        try {
            $endpoint = Endpoint::withTrashed()->where('ci_id', $ciId)->firstOrFail();
            $endpoint->restore();
            return response()->json($endpoint);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Endpoint not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function forceDelete(string $ciId)
    {
        try {
            Endpoint::withTrashed()->where('ci_id', $ciId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Endpoint not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}
