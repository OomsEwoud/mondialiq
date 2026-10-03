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
        $season = (int) config('services.api_football.season');

        return $season > 0 ? $season : (int) now('Europe/Brussels')->format('Y');
    }
}
