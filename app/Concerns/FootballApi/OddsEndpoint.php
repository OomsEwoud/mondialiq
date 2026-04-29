<?php

namespace App\Concerns\FootballApi;

trait OddsEndpoint
{
    public function getFixtureOdds(int $fixtureId)
    {
        //1 call per 3 hours
        return $this->call('/odds', ['fixture' => $fixtureId]);
    }

    public function getBookmakers()
    {
        //1 call per day
        return $this->call('/odds/bookmakers');
    }
}
