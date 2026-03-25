<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CiChangeLog;
use Illuminate\Http\Request;

class CiChangeLogController extends Controller
{
    
    public function index(Request $request)
    {
        try {
            $query = CiChangeLog::query();
 
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('change_log_id', 'like', "%{$s}%")
                      ->orWhere('ci_id', 'like', "%{$s}%")
                      ->orWhere('ci_name', 'like', "%{$s}%")
                      ->orWhere('change_type', 'like', "%{$s}%")
                      ->orWhere('change_by', 'like', "%{$s}%")
                      ->orWhere('rfs_reference', 'like', "%{$s}%");
                });
            }
 
            if ($request->filled('change_type')) $query->where('change_type', $request->change_type);
            if ($request->filled('ci_id'))        $query->where('ci_id', $request->ci_id);
            if ($request->filled('ci_table'))     $query->where('ci_table', $request->ci_table);
 
            $sortBy  = $request->get('sort_by', 'created_at');
            $sortDir = $request->get('sort_dir', 'desc');
            $query->orderBy($sortBy, $sortDir);
 
            return response()->json($query->paginate($request->get('per_page', 25)));
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // Store a manually created change log entry.
    // Note: change logs are usually auto-created by the CiObserver.
    // This is for manual entries only (e.g. planned changes, RFS records).
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'ci_id'              => 'required|string|max:50',
                'ci_name'            => 'required|string|max:255',
                'ci_table'           => 'required|string|max:100',
                'change_type'        => 'required|string|max:100',
                'change_description' => 'nullable|string',
                'change_by'          => 'required|string|max:255',
                'rfs_reference'      => 'nullable|string|max:100',
                'approved_by'        => 'nullable|string|max:255',
                'previous_values'    => 'nullable|array',
                'new_values'         => 'nullable|array',
            ]);
 
            $data['change_log_id'] = CiChangeLog::generateChangeLogId();
            return response()->json(CiChangeLog::create($data), 201);
 
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // Display a specific change log entry by change_log_id (e.g. CHG-LOG-001).
     
    public function show(CiChangeLog $ciChangeLog)
    {
        try {
            return response()->json($ciChangeLog);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }
}
