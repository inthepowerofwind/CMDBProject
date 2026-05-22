<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CiRelationship extends Model
{
   use SoftDeletes;

   // hides the internal auto-increment id; relationships_id is used as the public identifier
   protected $hidden = ['id'];

   // uses relationship_id as the route model binding key instead of the default id
   public function getRouteKeyName(): string { return 'relationship_id'; }
   protected $fillable = [
     'relationship_id',
     'source_ci_category',
     'source_ci_id',
     'source_ci_name',
     'relationship_type',
     'target_ci_category',
     'target_ci_id',
     'target_ci_name',
     'description',
     'criticality',
        
   ];

   protected $casts = [

    ];
}
