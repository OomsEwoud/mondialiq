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
        if (!$user) {
            return $query->whereRaw('1 = 0');
        }

        return $query
            ->with(['userPredictions' => fn (Builder $query) => $query
                ->whereBelongsTo($user)])
            ->whereHas('userPredictions', fn (Builder $query) => $query
                ->whereBelongsTo($user));
    }
}
