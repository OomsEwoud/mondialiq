<?php

namespace App\Concerns\FootballApi;

trait OddsEndpoint
{
    public function getCompetitionOdds(int $leagueId, int $season, string $date): array
    {
        return $this->callAllPages('/odds', ['league' => $leagueId, 'season' => $season, 'date' => $date]);
    }

    public function getFixtureOdds(int $fixtureId): array
    {
        return $this->callAllPages('/odds', ['fixture' => $fixtureId]);
    }

    public function getBookmakers(): array
    {
        return $this->call('/odds/bookmakers');
    }
}
