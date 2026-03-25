<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CiChangeLog extends Model
{
    use SoftDeletes;
    protected $hidden = ['id'];
    public function getRouteKeyName(): string { return 'change_log_id'; }
    protected $fillable = [
        'change_log_id',
        'ci_id',
        'ci_name',
        'ci_table',
        'change_type',
        'change_description',
        'change_by',
        'rfs_reference',
        'approved_by',
        'previous_values',
        'new_values',
    ];

    protected $casts = [
        'previous_values' => 'array',
        'new_values'      => 'array',
    ];

    public static function generateChangeLogId(): string
    {
        return \DB::transaction(function () {
            $last = self::withTrashed()
                ->where('change_log_id', 'like', 'CHG-LOG-%')
                ->lockForUpdate()
                ->orderByRaw("TRY_CAST(SUBSTRING(change_log_id, 10, LEN(change_log_id)) AS INT) DESC")
                ->value('change_log_id');

            if (!$last) return 'CHG-LOG-001';

            $number = (int) substr($last, 9);
            return 'CHG-LOG-' . str_pad($number + 1, 3, '0', STR_PAD_LEFT);
        });
    }
}
