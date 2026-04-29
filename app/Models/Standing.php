<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Standing extends Model
{
    protected $fillable = [
        'external_id',
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
        'team_id',
        'league_id',
        'season',
    ];

    protected $casts = [
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

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function league()
    {
        return $this->belongsTo(League::class);
    }
}
