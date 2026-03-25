<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NetworkDevice;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class NetworkDeviceController extends Controller
{
    private function generateCiId(): string
    {
        $last = NetworkDevice::withTrashed()
            ->where('ci_id', 'like', 'NET-%')
            ->orderByRaw('TRY_CAST(SUBSTRING(ci_id, 5, LEN(ci_id)) AS INT) DESC')
            ->value('ci_id');

        if (!$last) return 'NET-001';

        $number = (int) substr($last, 4);
        return 'NET-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }
    //Display a listing of the resource.
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? NetworkDevice::onlyTrashed()
                : NetworkDevice::query();
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
                'ci_name'            => 'required|string|max:255',
                'status'             => 'nullable|string',
                'ci_type'            => 'nullable|string',
                'environment'        => 'nullable|string',
                'ip_address'         => 'nullable|string',
                'mac_address'        => 'nullable|string',
                'vlan_segment'       => 'nullable|string',
                'ports_interfaces'   => 'nullable|string',
                'firmware_version'   => 'nullable|string',
                'patch_level'        => 'nullable|string',
                'location'           => 'nullable|string',
                'rack_position'      => 'nullable|string',
                'criticality'        => 'nullable|string',
                'business_service'   => 'nullable|string',
                'redundancy_ha'      => 'nullable|string',
                'assigned_owner'     => 'nullable|string',
                'department'         => 'nullable|string',
                'manufacturer'       => 'nullable|string',
                'model'              => 'nullable|string',
                'serial_number'      => 'nullable|string',
                'asset_tag'          => 'nullable|string',
                'purchase_date'      => 'nullable|date',
                'warranty_expiry'    => 'nullable|date',
                'eol_date'           => 'nullable|date',
                'last_config_review' => 'nullable|date',
                'baseline_applied'   => 'boolean',
                'monitoring_siem'    => 'boolean',
                'notes'              => 'nullable|string',
                // Add validation rules for other fields as needed
            ]);
            $data['ci_id'] = $this->generateCiId();
            return response()->json(NetworkDevice::create($data), 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Display the specified resource.
    public function show(NetworkDevice $networkDevice)
    {
        try {
            return response()->json($networkDevice);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Update the specified resource in storage.
    public function update(Request $request, NetworkDevice $networkDevice)
    {
        try {
             $data = $request->validate([
                'ci_name'            => 'sometimes|required|string|max:255',
                'status'             => 'nullable|string',
                'ci_type'            => 'nullable|string',
                'environment'        => 'nullable|string',
                'ip_address'         => 'nullable|string',
                'mac_address'        => 'nullable|string',
                'vlan_segment'       => 'nullable|string',
                'ports_interfaces'   => 'nullable|string',
                'firmware_version'   => 'nullable|string',
                'patch_level'        => 'nullable|string',
                'location'           => 'nullable|string',
                'rack_position'      => 'nullable|string',
                'criticality'        => 'nullable|string',
                'business_service'   => 'nullable|string',
                'redundancy_ha'      => 'nullable|string',
                'assigned_owner'     => 'nullable|string',
                'department'         => 'nullable|string',
                'manufacturer'       => 'nullable|string',
                'model'              => 'nullable|string',
                'serial_number'      => 'nullable|string',
                'asset_tag'          => 'nullable|string',
                'purchase_date'      => 'nullable|date',
                'warranty_expiry'    => 'nullable|date',
                'eol_date'           => 'nullable|date',
                'last_config_review' => 'nullable|date',
                'baseline_applied'   => 'boolean',
                'monitoring_siem'    => 'boolean',
                'notes'              => 'nullable|string',
                // Add validation rules for other fields as needed
            ]);

            $networkDevice->update($data);
            return response()->json($networkDevice);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Remove the specified resource from storage.
    public function destroy(NetworkDevice $networkDevice)
    {
        try {
            $networkDevice->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

     public function restore(string $ciId)
    {
        try {
            $networkDevice = NetworkDevice::withTrashed()->where('ci_id', $ciId)->firstOrFail();
            $networkDevice->restore();
            return response()->json($networkDevice);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Network device not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function forceDelete(string $ciId)
    {
        try {
            NetworkDevice::withTrashed()->where('ci_id', $ciId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Network device not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }    
}
