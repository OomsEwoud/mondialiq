<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HeadToHead extends Model
{
    protected $fillable = [
        'team_a_id',
        'team_b_id',
        'pair_key',
        'total_matches',
        'team_a_wins',
        'team_b_wins',
        'draws',
        'team_a_goals',
        'team_b_goals',
        'last_meeting_at',
        'raw_data',
        'fetched_at',
    ];

    protected $casts = [
        'team_a_id' => 'integer',
        'team_b_id' => 'integer',
        'total_matches' => 'integer',
        'team_a_wins' => 'integer',
        'team_b_wins' => 'integer',
        'draws' => 'integer',
        'team_a_goals' => 'integer',
        'team_b_goals' => 'integer',
        'last_meeting_at' => 'datetime',
        'raw_data' => 'array',
        'fetched_at' => 'datetime',
    ];

    public function teamA(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_a_id');
    }

    public function teamB(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_b_id');
    }
}
