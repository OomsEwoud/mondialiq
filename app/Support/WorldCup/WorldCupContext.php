<?php

namespace App\Support\WorldCup;

use App\Models\League;

class WorldCupContext
{
    public function leagueId(): int
    {
        return League::query()
            ->where('external_id', config('services.api_football.league_id'))
            ->value('id');
    }

    public function leagueIds(): array
    {
        $worldCupLeagueId = $this->leagueId();

        $friendliesLeagueIds = League::query()
            ->where('name', 'like', '%Friendlies%')
            ->whereNot('name', 'like', '%Women%')
            ->whereNot('name', 'like', '%Clubs%')
            ->pluck('id')
            ->all();

        return array_merge([$worldCupLeagueId], $friendliesLeagueIds);
    }

    public function season(): int
    {
        return config('services.api_football.season');
    }
}
