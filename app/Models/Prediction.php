<?php

namespace App\Models;

use App\Enums\PredictionTypes;
use App\Services\Prediction\UserPredictionScoringService;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
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
    'points_awarded_at',
])]
class Prediction extends Model
{
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
            'points_awarded_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function (Prediction $prediction): void {
            if ($prediction->points_awarded_at === null) {
                return;
            }

            if (! $prediction->wasRecentlyCreated && ! $prediction->wasChanged('points_awarded_at')) {
                return;
            }

            if ($prediction->source !== PredictionTypes::User) {
                return;
            }

            app(UserPredictionScoringService::class)->syncScoreboardPredictions($prediction);
        });
    }

    public function fixture(): BelongsTo
    {
        return $this->belongsTo(Fixture::class);
    }

    public function scopePointsPending(Builder $query): Builder
    {
        return $query->whereNull('points_awarded_at');
    }

    public function scopePointsEarned(Builder $query): Builder
    {
        return $query
            ->whereNotNull('points_awarded_at')
            ->where('points', '>', 0);
    }

    public function scopeNoPointsEarned(Builder $query): Builder
    {
        return $query
            ->whereNotNull('points_awarded_at')
            ->where('points', '<=', 0);
    }

    public function hasAwardedPoints(): bool
    {
        return $this->points_awarded_at !== null;
    }

    public function awardedPoints(): ?int
    {
        if (! $this->hasAwardedPoints()) {
            return null;
        }

        return $this->points;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'winner_id');
    }

    public function scoreboardPredictions(): HasMany
    {
        return $this->hasMany(ScoreboardPrediction::class);
    }
}
