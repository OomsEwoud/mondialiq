<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlayerSeasonStat extends Model
{
     protected $fillable = [
        'player_id',
        'league_id',
        'season',
        'appearances',
        'total_minutes',
        'position',
        'rating',
        'is_captain',
        'substitutes_in',
        'substitutes_out',
        'bench',
        'total_shots',
        'shots_on_target',
        'total_goals',
        'total_goals_conceded',
        'total_assists',
        'total_saves',
        'total_passes',
        'key_passes',
        'pass_accuracy',
        'total_tackles',
        'total_blocks',
        'total_interceptions',
        'total_duels',
        'duels_won',
        'total_dribbles_attempts',
        'dribbles_success',
        'dribbles_past',
        'fouls_drawn',
        'fouls_committed',
        'yellow_cards',
        'yellow_red_cards',
        'red_cards',
        'penalties_won',
        'penalties_committed',
        'penalties_scored',
        'penalties_missed',
        'penalties_saved',
    ];

    protected $casts = [
        'season' => 'integer',
        'appearances' => 'integer',
        'total_minutes' => 'integer',
        'rating' => 'float',
        'is_captain' => 'boolean',
        'substitutes_in' => 'integer',
        'substitutes_out' => 'integer',
        'bench' => 'integer',
        'total_shots' => 'integer',
        'shots_on_target' => 'integer',
        'total_goals' => 'integer',
        'total_goals_conceded' => 'integer',
        'total_assists' => 'integer',
        'total_saves' => 'integer',
        'total_passes' => 'integer',
        'key_passes' => 'integer',
        'pass_accuracy' => 'float',
        'total_tackles' => 'integer',
        'total_blocks' => 'integer',
        'total_interceptions' => 'integer',
        'total_duels' => 'integer',
        'duels_won' => 'integer',
        'total_dribbles_attempts' => 'integer',
        'dribbles_success' => 'integer',
        'dribbles_past' => 'integer',
        'fouls_drawn' => 'integer',
        'fouls_committed' => 'integer',
        'yellow_cards' => 'integer',
        'yellow_red_cards' => 'integer',
        'red_cards' => 'integer',
        'penalties_won' => 'integer',
        'penalties_committed' => 'integer',
        'penalties_scored' => 'integer',
        'penalties_missed' => 'integer',
        'penalties_saved' => 'integer',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }

    public function league()
    {
        return $this->belongsTo(League::class);
    }
}
