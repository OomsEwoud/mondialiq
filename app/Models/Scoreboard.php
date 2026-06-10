<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'name',
    'description',
    'icon',
    'accent_color',
    'code',
    'owner_id',
    'reward_title',
    'reward_description',
    'visibility',
    'is_active',
    'scoring_rules',
])]
class Scoreboard extends Model
{
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'scoring_rules' => 'array',
        ];
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'users_has_scoreboards')
            ->withPivot(['role', 'joined_at'])
            ->withTimestamps();
    }

    public function scoreboardPredictions(): HasMany
    {
        return $this->hasMany(ScoreboardPrediction::class);
    }

    public function scoringRule(string $key, mixed $default = null): mixed
    {
        $rules = $this->scoring_rules ?? [];

        $defaults = [
            'exact_score_points' => 10,
            'correct_result_points' => 5,
            'correct_goal_difference_points' => 3,
            'correct_home_goals_points' => 1,
            'correct_away_goals_points' => 1,
            'boosted_predictions_enabled' => false,
            'boosted_predictions_limit' => 3,
            'boosted_confidence_threshold' => 70,
            'boosted_prediction_bonus_points' => 2,
        ];

        return $rules[$key] ?? $defaults[$key] ?? $default;
    }
}
