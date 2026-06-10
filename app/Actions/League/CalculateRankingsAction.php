<?php

namespace App\Actions\League;

use App\Models\User;
use Illuminate\Support\Collection;

class CalculateRankingsAction
{
    /**
     * Assigns standard competition ranking (1, 1, 3, 4) to users based on points and prediction count.
     *
     * @param  Collection<int, User>  $users
     * @return Collection<int, User>
     */
    public function execute(Collection $users): Collection
    {
        $rank = 1;
        $offset = 0;
        $previousPoints = null;
        $previousPredictionsCount = null;

        return $users->map(function (User $user) use (&$rank, &$offset, &$previousPoints, &$previousPredictionsCount) {
            $points = $user->predictions_sum_points ?? 0;
            $predictionsCount = $user->predictions_count ?? 0;

            if ($previousPoints === $points && $previousPredictionsCount === $predictionsCount) {
                $offset++;
            } else {
                $rank += $offset;
                $offset = 1;
                $previousPoints = $points;
                $previousPredictionsCount = $predictionsCount;
            }

            $user->setAttribute('rank', $rank);

            return $user;
        });
    }
}
