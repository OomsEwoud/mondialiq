<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
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

    public function rankedUsers(): BelongsToMany
    {
        $exactScorePoints = (int) $this->scoringRule('exact_score_points', 20);

        return $this->users()
            ->select(['users.id', 'users.name', 'users.avatar', 'users.is_system_user'])
            ->withSum([
                'scoreboardPredictions as predictions_sum_points' => fn (Builder $query) => $query
                    ->where('scoreboard_predictions.scoreboard_id', $this->id)
                    ->whereNotNull('scoreboard_predictions.points_awarded_at'),
            ], 'scoreboard_predictions.points')
            ->withCount('predictions')
            ->withCount([
                'scoreboardPredictions as scoring_predictions_count' => fn (Builder $query) => $query
                    ->where('scoreboard_predictions.scoreboard_id', $this->id)
                    ->whereNotNull('scoreboard_predictions.points_awarded_at'),
                'scoreboardPredictions as perfect_predictions_count' => fn (Builder $query) => $query
                    ->where('scoreboard_predictions.scoreboard_id', $this->id)
                    ->whereNotNull('scoreboard_predictions.points_awarded_at')
                    ->whereRaw('scoreboard_predictions.points >= ?', [$exactScorePoints]),
            ])
            ->withMax('predictions', 'updated_at')
            ->orderByDesc('predictions_sum_points')
            ->orderByDesc('predictions_count')
            ->orderBy('users.name');
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
            'boosted_confidence_threshold' => 'low',
            'boosted_prediction_bonus_points' => 2,
        ];

        return $rules[$key] ?? $defaults[$key] ?? $default;
    }

    public function boostedPredictionsEnabled(): bool
    {
        return (bool) $this->scoringRule('boosted_predictions_enabled', false);
    }

    public function boostedPredictionsLimit(): int
    {
        return (int) $this->scoringRule('boosted_predictions_limit', 3);
    }

    public function boostedConfidenceThreshold(): string
    {
        $threshold = $this->scoringRule('boosted_confidence_threshold', 'low');

        return is_string($threshold) ? $threshold : (string) $threshold;
    }

    public function usedBoostsFor(User $user): int
    {
        return $this->scoreboardPredictions()
            ->where('is_boosted', true)
            ->whereHas('prediction', fn ($q) => $q->where('user_id', $user->id))
            ->count();
    }

    public function remainingBoostsFor(User $user): int
    {
        if (! $this->boostedPredictionsEnabled()) {
            return 0;
        }

        return max(0, $this->boostedPredictionsLimit() - $this->usedBoostsFor($user));
    }
}
