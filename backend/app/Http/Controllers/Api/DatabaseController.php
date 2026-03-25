<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmdbDatabase;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DatabaseController extends Controller
{
    private function generateCiId(): string
    {
        $last = CmdbDatabase::withTrashed()
            ->where('ci_id', 'like', 'DB-%')
            ->orderByRaw('TRY_CAST(SUBSTRING(ci_id, 4, LEN(ci_id)) AS INT) DESC')
            ->value('ci_id');

        if (!$last) return 'DB-001';

        $number = (int) substr($last, 3);
        return 'DB-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }
    //Display a listing of the resource.
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? CmdbDatabase::onlyTrashed()
                : CmdbDatabase::query();
            //search
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('ci_id', 'like', "%{$s}%")
                    ->orWhere('database_name', 'like', "%{$s}%")
                    ->orWhere('db_type', 'like', "%{$s}%")
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
            'database_name'         => 'required|string|max:255',
            'status'                => 'nullable|string',
            'db_type'               => 'nullable|string',
            'version'               => 'nullable|string',
            'environment'           => 'nullable|string',
            'host_server_ci'        => 'nullable|string',
            'ip_address'            => 'nullable|string',
            'port'                  => 'nullable|string',
            'criticality'           => 'nullable|string',
            'data_classification'   => 'nullable|string',
            'size_gb'               => 'nullable|integer',
            'backup_enabled'        => 'boolean',
            'backup_frequency'      => 'nullable|string',
            'last_backup'           => 'nullable|date',
            'encryption_at_rest'    => 'boolean',
            'tde_enabled'           => 'boolean',
            'access_control'        => 'boolean',
            'monitoring'            => 'boolean',
            'patch_level'           => 'nullable|string',
            'eol_date'              => 'nullable|date',
            'db_owner'              => 'nullable|string',
            'bussiness_application' => 'nullable|string',
            'last_review'           => 'nullable|date',
            'notes'                 => 'nullable|string',
            ]);

            $data['ci_id'] = $this->generateCiId();

            return response()->json(CmdbDatabase::create($data), 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Display the specified resource.
    public function show(CmdbDatabase $database)
    {
        try {
            return response()->json($database);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Update the specified resource in storage.
    public function update(Request $request, CmdbDatabase $database)
    {
        try {
             $data = $request->validate([
            'database_name'         => 'sometimes|required|string|max:255',
            'status'                => 'nullable|string',
            'db_type'               => 'nullable|string',
            'version'               => 'nullable|string',
            'environment'           => 'nullable|string',
            'host_server_ci'        => 'nullable|string',
            'ip_address'            => 'nullable|string',
            'port'                  => 'nullable|string',
            'criticality'           => 'nullable|string',
            'data_classification'   => 'nullable|string',
            'size_gb'               => 'nullable|integer',
            'backup_enabled'        => 'boolean',
            'backup_frequency'      => 'nullable|string',
            'last_backup'           => 'nullable|date',
            'encryption_at_rest'    => 'boolean',
            'tde_enabled'           => 'boolean',
            'access_control'        => 'boolean',
            'monitoring'            => 'boolean',
            'patch_level'           => 'nullable|string',
            'eol_date'              => 'nullable|date',
            'db_owner'              => 'nullable|string',
            'bussiness_application' => 'nullable|string',
            'last_review'           => 'nullable|date',
            'notes'                 => 'nullable|string',
            ]);

            $database->fill($data)->save();
            return response()->json($database->fresh());

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Remove the specified resource from storage.
    public function destroy(CmdbDatabase $database)
    {
        try {
            $database->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function restore(string $ciId)
    {
        try {
            $database = CmdbDatabase::withTrashed()->where('ci_id', $ciId)->firstOrFail();
            $database->restore();
            return response()->json($database);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Database record not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    public function forceDelete(string $ciId)
    {
        try {
            CmdbDatabase::withTrashed()->where('ci_id', $ciId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Database record not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}
