<?php

namespace App\Support\Competition;

use App\Models\League;

class CompetitionContext
{
    public function leagueIds(): array
    {
        return League::query()
            ->whereHas('fixtures', fn ($query) => $query->where('season', $this->season()))
            ->pluck('id')
            ->all();
    }

    public function season(): int
    {
        return (int) config('services.api_football.season');
    }
}
