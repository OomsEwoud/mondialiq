<?php

namespace App\Models;

use App\Enums\PredictionTypes;
use Illuminate\Database\Eloquent\Model;

class Prediction extends Model
{
    protected $fillable = [
        'fixture_id',
        'user_id',
        'winner_id',
        'source',
        'winner_comment',
        'total_goals',
        'home_goals',
        'away_goals',
        'advice',
        'home_chance',
        'draw_chance',
        'away_chance',
        'points'
    ];

    protected $casts = [
        'source' => PredictionTypes::class,
        'total_goals' => 'integer',
        'home_goals' => 'integer',
        'away_goals' => 'integer',
        'home_chance' => 'float',
        'draw_chance' => 'float',
        'away_chance' => 'float',
        'points' => 'integer'
    ];

    public function fixture()
    {
        return $this->belongsTo(Fixture::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function winner()
    {
        return $this->belongsTo(Team::class, 'winner_id');
    }
}
