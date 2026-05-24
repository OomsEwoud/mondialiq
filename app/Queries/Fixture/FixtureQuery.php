<?php

namespace App\Queries\Fixture;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;

class FixtureQuery
{
    public function __construct(protected int $leagueId, protected int $season)
    {
    }

    public function build(array $filters): Builder
    {
        $query = Fixture::query()
            ->where('league_id', $this->leagueId)
            ->where('season', $this->season)
            ->with(['homeTeam', 'awayTeam', 'apiPrediction']);

        if ($filters['round']) {
            $query->where('round_name', $filters['round']);
        }

        if ($filters['date']) {
            $query->whereDate('match_date', $filters['date']);
        }

        if ($filters['team']) {
            $query->where(function (Builder $q) use ($filters) {
                $q->whereHas('homeTeam', fn (Builder $query) => $query->where('name', 'like', "%{$filters['team']}%"))
                    ->orWhereHas('awayTeam', fn (Builder $query) => $query->where('name', 'like', "%{$filters['team']}%"));
            });
        }

        if (($filters['status'] ?? 'all') === 'played') {
            $query->where('status_long', 'like', '%Finished%');
        }

        if (($filters['status'] ?? 'all') === 'upcoming') {
            $query
                ->where('status_long', 'not like', '%Finished%')
                ->where('status_long', 'not like', '%Postpon%')
                ->where('status_long', 'not like', '%Cancel%')
                ->where('status_long', 'not like', '%Abandon%')
                ->where('status_long', 'not like', '%Forfeit%');
        }

        return $query->orderBy('match_date');
    }
}
