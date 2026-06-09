<?php

namespace App\Queries\Fixture;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PredictionFixtureQuery
{
    private const POINTS_STATE_ALL = 'all';

    private const POINTS_STATE_PENDING = 'points-pending';

    private const POINTS_STATE_EARNED = 'points-earned';

    private const POINTS_STATE_NO_POINTS = 'no-points-earned';

    public function applyMode(Builder $query, string $mode, ?User $user, array $filters = []): Builder
    {
        if ($mode === 'ai') {
            return $this->withAiPredictions($query, $filters);
        }

        return $this->withUserPredictions($query, $user, $filters);
    }

    private function withAiPredictions(Builder $query, array $filters): Builder
    {
        $pointsState = $this->pointsStateFilter($filters);

        return $query
            ->with('aiPrediction')
            ->whereHas('aiPrediction', function (Builder $query) use ($pointsState) {
                if ($pointsState !== self::POINTS_STATE_ALL) {
                    $this->applyPointsStateFilter($query, $pointsState);
                }
            });
    }

    private function withUserPredictions(Builder $query, ?User $user, array $filters): Builder
    {
        if ($user === null) {
            return $this->withoutResults($query);
        }

        $pointsState = $this->pointsStateFilter($filters);

        return $query
            ->with([
                'userPredictions' => fn ($query) => $this->userPredictionEagerLoad($query, $user, $pointsState),
            ])
            ->whereHas(
                'userPredictions',
                fn (Builder $query) => $this->userPredictionConstraint($query, $user, $pointsState),
            );
    }

    private function withoutResults(Builder $query): Builder
    {
        return $query->whereKey([]);
    }

    private function userPredictionEagerLoad(HasMany $query, User $user, string $pointsState): Builder|HasMany
    {
        return $this->userPredictionConstraint($query, $user, $pointsState)->with('winner');
    }

    private function userPredictionConstraint(Builder|HasMany $query, User $user, string $pointsState): Builder|HasMany
    {
        return $query
            ->whereBelongsTo($user)
            ->where('source', 'user')
            ->when(
                $pointsState !== self::POINTS_STATE_ALL,
                fn (Builder|HasMany $query) => $this->applyPointsStateFilter($query, $pointsState),
            );
    }

    private function pointsStateFilter(array $filters): string
    {
        $pointsState = $filters['pointsState'] ?? self::POINTS_STATE_ALL;

        return is_string($pointsState) && in_array($pointsState, [
            self::POINTS_STATE_PENDING,
            self::POINTS_STATE_EARNED,
            self::POINTS_STATE_NO_POINTS,
        ], true)
            ? $pointsState
            : self::POINTS_STATE_ALL;
    }

    private function applyPointsStateFilter(Builder|HasMany $query, string $pointsState): Builder|HasMany
    {
        return match ($pointsState) {
            self::POINTS_STATE_PENDING => $query->pointsPending(),
            self::POINTS_STATE_EARNED => $query->pointsEarned(),
            self::POINTS_STATE_NO_POINTS => $query->noPointsEarned(),
            default => $query,
        };
    }
}
