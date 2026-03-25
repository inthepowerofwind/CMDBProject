<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CiRelationship extends Model
{
   use SoftDeletes;
   //protected $table = 'ci_relationships';
   protected $hidden = ['id'];

   public function getRouteKeyName(): string { return 'relationship_id'; }
   protected $fillable = [
     'relationship_id',
     'source_ci_id',
     'source_ci_name',
     'relationship_type',
     'target_ci_id',
     'target_ci_name',
     'description',
     'criticality',
        
   ];

   protected $casts = [

    ];
}
