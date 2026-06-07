<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'scoreboard_id',
    'prediction_id',
    'is_boosted',
    'points',
    'points_awarded_at',
])]
class ScoreboardPrediction extends Model
{
    protected $table = 'scoreboard_predictions';

    protected function casts(): array
    {
        return [
            'is_boosted' => 'boolean',
            'points' => 'integer',
            'points_awarded_at' => 'datetime',
        ];
    }

    public function scoreboard(): BelongsTo
    {
        return $this->belongsTo(Scoreboard::class);
    }

    public function prediction(): BelongsTo
    {
        return $this->belongsTo(Prediction::class);
    }
}
