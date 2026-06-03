<?php

namespace App\Queries\Fixture;

use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

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
                'userPredictions' => fn ($query) => $this->userPredictionEagerLoad($query, $user),
            ])
            ->whereHas('userPredictions', fn (Builder $query) => $this->userPredictionConstraint($query, $user));
    }

    private function withoutResults(Builder $query): Builder
    {
        return $query->whereKey([]);
    }

    private function userPredictionEagerLoad(Builder $query, User $user)
    {
        return $this->userPredictionConstraint($query, $user)
            ->with('winner');
    }

    private function userPredictionConstraint(Builder $query, User $user)
    {
        return $query->whereBelongsTo($user);
    }
}
