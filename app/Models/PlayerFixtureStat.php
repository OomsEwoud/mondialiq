<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerFixtureStat extends Model
{
    protected $fillable = [
        'fixture_id',
        'player_id',
        'game_minutes',
        'number',
        'position',
        'rating',
        'is_captain',
        'is_substitute',
        'offsides',
        'total_shots',
        'shots_on_target',
        'goals',
        'goals_conceded',
        'assists',
        'saves',
        'passes',
        'key_passes',
        'passes_accuracy',
        'tackles',
        'blocks',
        'interceptions',
        'duels',
        'duels_won',
        'dribbles_attempts',
        'dribbles_success',
        'dribbles_past',
        'fouls_drawn',
        'fouls_committed',
        'yellow_cards',
        'red_cards',
        'penalties_won',
        'penalties_committed',
        'penalties_scored',
        'penalties_missed',
        'penalties_saved'
    ];


    protected $casts = [
        'fixture_id' => 'integer',
        'player_id' => 'integer',
        'game_minutes' => 'integer',
        'number' => 'integer',
        'rating' => 'float',
        'is_captain' => 'boolean',
        'is_substitute' => 'boolean',
        'offsides' => 'integer',
        'total_shots' => 'integer',
        'shots_on_target' => 'integer',
        'goals' => 'integer',
        'goals_conceded' => 'integer',
        'assists' => 'integer',
        'saves' => 'integer',
        'passes' => 'integer',
        'key_passes' => 'integer',
        'passes_accuracy' => 'float',
        'tackles' => 'integer',
        'blocks' => 'integer',
        'interceptions' => 'integer',
        'duels' => 'integer',
        'duels_won' => 'integer',
        'dribbles_attempts' => 'integer',
        'dribbles_success' => 'integer',
        'dribbles_past' => 'integer',
        'fouls_drawn' => 'integer',
        'fouls_committed' => 'integer',
        'yellow_cards' => 'integer',
        'red_cards' => 'integer',
        'penalties_won' => 'integer',
        'penalties_committed' => 'integer',
        'penalties_scored' => 'integer',
        'penalties_missed' => 'integer',
        'penalties_saved' => 'integer',
    ];

    public function fixture()
    {
        return $this->belongsTo(Fixture::class);
    }

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
