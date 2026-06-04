<?php

namespace App\Queries\Fixture;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PredictionFixtureQuery
{
    public function applyMode(Builder $query, string $mode, ?User $user): Builder
    {
        if ($mode === 'ai') {
            return $this->withAiPredictions($query);
        }

        return $this->withUserPredictions($query, $user);
    }

    private function withAiPredictions(Builder $query): Builder
    {
        return $query
            ->with('aiPrediction')
            ->whereHas('aiPrediction');
    }

    private function withUserPredictions(Builder $query, ?User $user): Builder
    {
        if ($user === null) {
            return $this->withoutResults($query);
        }

        return $query
            ->with([
                'userPredictions' => fn($query) => $this->userPredictionEagerLoad($query, $user),
            ])
            ->whereHas('userPredictions', fn(Builder $query) => $this->userPredictionConstraint($query, $user));
    }

    private function withoutResults(Builder $query): Builder
    {
        return $query->whereKey([]);
    }

    private function userPredictionEagerLoad(HasMany $query, User $user): Builder|HasMany
    {
        return $this->userPredictionConstraint($query, $user)->with('winner');
    }

    private function userPredictionConstraint(Builder|HasMany $query, User $user): Builder|HasMany
    {
        return $query
            ->whereBelongsTo($user)
            ->where('source', 'user');
    }
}
