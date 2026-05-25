<?php

namespace App\Concerns\FootballApi;

trait OddsEndpoint
{
    public function getFixtureOdds(int $fixtureId): array
    {
        //1 call per 3 hours
        return $this->call('/odds', ['fixture' => $fixtureId]);
    }

    public function getBookmakers(): array
    {
        //1 call per day
        return $this->call('/odds/bookmakers');
    }
}
