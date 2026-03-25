<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ServerController extends Controller
{
    private function generateCiId(): string
    {
        $last = Server::withTrashed()
            ->where('ci_id', 'like', 'SRV-%')
            ->orderByRaw('TRY_CAST(SUBSTRING(ci_id, 5, LEN(ci_id)) AS INT) DESC')
            ->value('ci_id');

        if (!$last) return 'SRV-001';

        $number = (int) substr($last, 4);
        return 'SRV-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }

    //Display a listing of the resource.
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? Server::onlyTrashed()
                : Server::query();

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
            if ($request->filled('status'))      $query->where('status', $request->status);
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
                'hostname'           => 'nullable|string',
                'operating_system'   => 'nullable|string',
                'os_version'         => 'nullable|string',
                'patch_level'        => 'nullable|string',
                'cpu_cores'          => 'nullable|integer',
                'ram_gb'             => 'nullable|integer',
                'storage_tb'         => 'nullable|integer',
                'virtualized'        => 'boolean',
                'location'           => 'nullable|string',
                'rack_slot'          => 'nullable|string',
                'criticality'        => 'nullable|string',
                'business_service'   => 'nullable|string',
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
                'backup_enabled'     => 'boolean',
                'monitoring_siem'    => 'boolean',
                'notes'              => 'nullable|string',
            ]);

            $data['ci_id'] = $this->generateCiId();

            return response()->json(Server::create($data), 201);

        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

     //Display the specified resource.
     public function show(Server $server)
     {
        try {
            return response()->json($server);

        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }


    //Update the specified resource in storage.
    public function update(Request $request, Server $server)
    {
        try {
             $data = $request->validate([
                'ci_name'            => 'sometimes|required|string|max:255',
                'status'             => 'nullable|string',
                'ci_type'            => 'nullable|string',
                'environment'        => 'nullable|string',
                'hostname'           => 'nullable|string',
                'operating_system'   => 'nullable|string',
                'os_version'         => 'nullable|string',
                'patch_level'        => 'nullable|string',
                'cpu_cores'          => 'nullable|integer',
                'ram_gb'             => 'nullable|integer',
                'storage_tb'         => 'nullable|integer',
                'virtualized'        => 'boolean',
                'location'           => 'nullable|string',
                'rack_slot'          => 'nullable|string',
                'criticality'        => 'nullable|string',
                'business_service'   => 'nullable|string',
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
                'backup_enabled'     => 'boolean',
                'monitoring_siem'    => 'boolean',
                'notes'              => 'nullable|string',
            ]);

            $server->update($data);
            return response()->json($server);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Remove the specified resource from storage.
    public function destroy(Server $server)
    {
        try {
            $server->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function restore(string $ciId)
    {
        try {
            $server = Server::withTrashed()->where('ci_id', $ciId)->firstOrFail();
            $server->restore();
            return response()->json($server);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Server not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function forceDelete(string $ciId)
    {
        try {
            Server::withTrashed()->where('ci_id', $ciId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Server not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}
