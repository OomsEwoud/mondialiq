<?php

namespace App\Concerns\FootballApi;

trait FixtureEndpoints
{
    public function getRounds(int $idLeague, int $season)
    {
        //1 call per day 
        return $this->call('/fixtures/rounds', ['league' => $idLeague, 'season' => $season]);
    }

    public function getFixtures(int $leagueId, int $season)
    {
        //1 call per hour
        return $this->call('/fixtures', ['league' => $leagueId, 'season' => $season, 'timezone' => 'Europe/Brussels']);
    }

    public function getHeadToHead(int $team1Id, int $team2Id)
    {
        //1 call per day
        return $this->call('/fixtures/headtohead', ['h2h' => "{$team1Id}-{$team2Id}"]);
    }

    public function getFixtureStats(int $fixtureId)
    {
        //1 call per minute
        return $this->call('/fixtures/statistics', ['fixture' => $fixtureId]);
    }

    public function getFixtureEvents(int $fixtureId)
    {
        //1 call per minute
        return $this->call('/fixtures/events', ['fixture' => $fixtureId]);
    }

    public function getFixtureLineups(int $fixtureId)
    {
        //1 call per 15 minutes
        return $this->call('/fixtures/lineups', ['fixture' => $fixtureId]);
    }

    public function getFixturePlayersStats(int $fixtureId)
    {
        //1 call per minute
        return $this->call('/fixtures/players', ['fixture' => $fixtureId]);
    }

    public function getInjuries(int $leagueId,int $season)
    {
        //1 call per day
        return $this->call('/injuries', ['league'=> $leagueId , 'season' => $season]);
    }

    public function getFixturePrediction(int $fixtureId)
    {
        //1call per hour on matchdays otherwise 1 call per day
        return $this->call('/predictions', ['fixture' => $fixtureId]);
    }

    public function getVenue(int $venueId)
    {
        //get it with first call to fixture this give a venue id
        //1 call per day
        return $this->call('/venues', ['id' => $venueId]);
    }

}
