<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'team_id',
    'group_name',
    'points',
    'rank',
    'matches_played',
    'wins',
    'draws',
    'losses',
    'goals_for',
    'goals_against',
    'goal_difference',
    'form',
    'attacking_form',
    'defensive_form',
    'goals_scored_last_5',
    'goals_conceded_last_5',
    'league_id',
    'season',
])]
class Standing extends Model
{
    protected function casts(): array
    {
        return [
            'rank' => 'integer',
            'points' => 'integer',
            'matches_played' => 'integer',
            'wins' => 'integer',
            'draws' => 'integer',
            'losses' => 'integer',
            'goals_for' => 'integer',
            'goals_against' => 'integer',
            'goal_difference' => 'integer',
            'season' => 'integer',
            'goals_scored_last_5' => 'integer',
            'goals_conceded_last_5' => 'integer',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function league(): BelongsTo
    {
        return $this->belongsTo(League::class);
    }
}
