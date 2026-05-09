<?php

namespace App\Queries\Fixture;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;

class FixtureQuery
{
    public function __construct(protected int $leagueId, protected int $season)
    {
    }
    
    public function build(array $filters)
    {
        return Fixture::query()
            ->where('league_id', $this->leagueId)
            ->where('season', $this->season)
            ->with(['homeTeam', 'awayTeam', 'apiPrediction'])
            ->when($filters['round'], fn($q) => $q->where('round_name', $filters['round']))
            ->when($filters['date'], fn($q) => $q->whereDate('match_date', $filters['date']))
            ->when($filters['team'], fn($q) => $q->where(function ($q) use ($filters) {
                $q->whereHas('homeTeam', fn($q) => $q->where('name', 'like', "%{$filters['team']}%"))
                    ->orWhereHas('awayTeam', fn($q) => $q->where('name', 'like', "%{$filters['team']}%"));
            }))
            ->orderBy('match_date');
    }
}
