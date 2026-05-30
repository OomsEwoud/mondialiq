<?php

namespace App\Models;

use App\Enums\PredictionTypes;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Prediction extends Model
{
    protected $fillable = [
        'fixture_id',
        'user_id',
        'winner_id',
        'source',
        'total_goals',
        'home_goals',
        'away_goals',
        'confidence',
        'advice',
        'home_chance',
        'draw_chance',
        'away_chance',
        'points',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'source' => PredictionTypes::class,
            'total_goals' => 'float',
            'home_goals' => 'float',
            'away_goals' => 'float',
            'home_chance' => 'float',
            'draw_chance' => 'float',
            'away_chance' => 'float',
            'points' => 'integer',
        ];
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_id');
    }
}
