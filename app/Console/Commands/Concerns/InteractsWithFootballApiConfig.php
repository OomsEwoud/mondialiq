<?php

namespace App\Console\Commands\Concerns;

trait InteractsWithFootballApiConfig
{
    /**
     * @return array{leagueId: int, season: int}|null
     */
    protected function footballApiConfig(): ?array
    {
        $leagueId = (int) config('services.api_football.league_id');
        $season = (int) config('services.api_football.season');

        if ($leagueId <= 0 || $season <= 0) {
            $this->error('API Football league_id of season is niet correct geconfigureerd.');

            return null;
        }

        return [
            'leagueId' => $leagueId,
            'season' => $season,
        ];
    }
}
