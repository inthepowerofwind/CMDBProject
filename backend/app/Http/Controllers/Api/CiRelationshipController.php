<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CiRelationship;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;


class CiRelationshipController extends Controller
{
     /**
     * Auto-generate the next relationship_id (e.g. REL-001, REL-002...).
     */
    private function generateRelationshipId(): string
    {
        $last = CiRelationship::withTrashed()
            ->where('relationship_id', 'like', 'REL-%')
            ->orderByRaw('LEN(relationship_id) DESC, relationship_id DESC')
            ->value('relationship_id');

        if (!$last) {
            return 'REL-001';
        }

        $number = (int) substr($last, 4);
        return 'REL-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
    }

    /**
     * Display a listing of CI relationships.
     */
    public function index(Request $request)
    {
        try {
            $query = $request->boolean('archived')
                ? CiRelationship::onlyTrashed()
                : CiRelationship::query();
    
            //search
            if ($request->filled('search')) {
                $s = $request->search;
                $query->where(function ($q) use ($s) {
                    $q->where('relationship_id', 'like', "%{$s}%")
                      ->orWhere('source_ci_name', 'like', "%{$s}%")
                      ->orWhere('target_ci_name', 'like', "%{$s}%")
                      ->orWhere('relationship_type', 'like', "%{$s}%")
                      ->orWhere('description', 'like', "%{$s}%");
                });
            }

            // Filters
            if ($request->filled('relationship_type')) $query->where('relationship_type', $request->relationship_type);
            if ($request->filled('criticality'))        $query->where('criticality', $request->criticality);

            // Filter by source or target CI
            if ($request->filled('ci_id')) {
                $ciId = $request->ci_id;
                $query->where(function ($q) use ($ciId) {
                    $q->where('source_ci_id', $ciId)->orWhere('target_ci_id', $ciId);
                });
            }

            // Sort
            $sortBy  = $request->get('sort_by', 'relationship_id');
            $sortDir = $request->get('sort_dir', 'asc');
            $query->orderBy($sortBy, $sortDir);

            return response()->json($query->paginate($request->get('per_page', 25)));

            } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // Store a newly created CI relationship.
    // relationship_id is auto-generated.
    public function store(Request $request)
    {
        try {
            $data = $request->validate([
                'source_ci_id'      => 'required|string',
                'source_ci_name'    => 'required|string|max:255',
                'relationship_type' => 'required|string|max:100',
                'target_ci_id'      => 'required|string',
                'target_ci_name'    => 'required|string|max:255',
                'description'       => 'nullable|string',
                'criticality'       => 'string|in:Critical,High,Medium,Low',
            ]);
 
            $data['relationship_id'] = $this->generateRelationshipId();
            return response()->json(CiRelationship::create($data), 201);
 
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Display a specific CI relationship by relationship_id.
    
    public function show(CiRelationship $ciRelationship)
    {
        try {
            return response()->json($ciRelationship);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // Update an existing CI relationship.
    // relationship_id cannot be changed.
    public function update(Request $request, CiRelationship $ciRelationship)
    {
                try {
            $data = $request->validate([
                
                'source_ci_id'      => 'sometimes|required|string|max:100',
                'source_ci_name'    => 'sometimes|required|string|max:255',
                'relationship_type' => 'sometimes|required|string|max:100',
                'target_ci_id'      => 'sometimes|required|string|max:100',
                'target_ci_name'    => 'sometimes|required|string|max:255',

                'description'       => 'nullable|string',
                'criticality'       => 'string|in:Critical,High,Medium,Low',
            ]);
 
            $ciRelationship->update($data);
            return response()->json($ciRelationship);
 
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => $e->errors()], 422);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Soft-delete a CI relationship.
    
    public function destroy(CiRelationship $ciRelationship)
    {
        try {
            $ciRelationship->delete();
            return response()->json(['message' => 'Deleted'], 204);
 
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Restore a soft-deleted CI relationship.
    
    public function restore(string $relationshipId)
    {
        try {
            $relationship = CiRelationship::withTrashed()->where('relationship_id', $relationshipId)->firstOrFail();
            $relationship->restore();
            return response()->json($relationship);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'CI relationship not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    //Permanently delete a CI relationship.
    public function forceDelete(string $relationshipId)
    {
        try {
            CiRelationship::withTrashed()->where('relationship_id', $relationshipId)->firstOrFail()->forceDelete();
            return response()->json(['message' => 'Permanently Deleted'], 204);
 
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'CI relationship not found.'], 404);
        } catch (\Throwable $th) {
            \Log::error($th->getMessage());
            return response()->json(['message' => 'Something went wrong. Please contact IT.'], 500);
        }
    }

    // Lookup CI name by CI ID across all CI types.
    public function lookupCi(string $ciId)
    {
        try {
            $models = [
                \App\Models\Server::class         => 'ci_name',
                \App\Models\NetworkDevice::class  => 'ci_name',
                \App\Models\Endpoint::class       => 'ci_name',
                \App\Models\Software::class       => 'software_name',
                \App\Models\CloudService::class   => 'service_name',
                \App\Models\CmdbDatabase::class   => 'database_name',
            ];

            foreach ($models as $model => $nameColumn) {
                $ci = $model::where('ci_id', $ciId)->first(['ci_id', $nameColumn]);
                if ($ci) {
                    return response()->json([
                        'ci_id'   => $ci->ci_id,
                        'ci_name' => $ci->{$nameColumn},
                    ]);
                }
            }

            return response()->json(['message' => 'CI not found.'], 404);

        } catch (\Throwable $th) {
            \Log::error('lookupCi error: ' . $th->getMessage());
            return response()->json(['message' => $th->getMessage()], 500);
        }
    }
}
