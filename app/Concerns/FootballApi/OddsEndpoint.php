<?php

namespace App\Concerns\FootballApi;

trait OddsEndpoint
{
    public function getFixtureOdds(int $fixtureId): array
    {
        return $this->call('/odds', ['fixture' => $fixtureId]);
    }

    public function getBookmakers(): array
    {
        return $this->call('/odds/bookmakers');
    }
}
