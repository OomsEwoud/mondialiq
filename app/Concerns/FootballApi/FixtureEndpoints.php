<?php

namespace App\Concerns\FootballApi;

trait FixtureEndpoints
{
    public function getFixtures(int $leagueId, int $season): array
    {
        return $this->call('/fixtures', [
            'league' => $leagueId,
            'season' => $season,
            'timezone' => 'Europe/Brussels',
        ]);
    }

    public function getHeadToHead(int $team1Id, int $team2Id): array
    {
        return $this->call('/fixtures/headtohead', ['h2h' => "{$team1Id}-{$team2Id}"]);
    }

    public function getFixtureStats(int $fixtureId): array
    {
        return $this->call('/fixtures/statistics', ['fixture' => $fixtureId]);
    }

    public function getFixtureEvents(int $fixtureId): array
    {
        return $this->call('/fixtures/events', ['fixture' => $fixtureId]);
    }

    public function getFixtureLineups(int $fixtureId): array
    {
        return $this->call('/fixtures/lineups', ['fixture' => $fixtureId]);
    }

    public function getFixturePlayersStats(int $fixtureId): array
    {
        return $this->call('/fixtures/players', ['fixture' => $fixtureId]);
    }

    public function getInjuries(int $leagueId, int $season): array
    {
        return $this->call('/injuries', ['league' => $leagueId, 'season' => $season]);
    }

    public function getFixturePrediction(int $fixtureId): array
    {
        return $this->call('/predictions', ['fixture' => $fixtureId]);
    }

    public function getVenue(int $venueId): array
    {
        return $this->call('/venues', ['id' => $venueId]);
    }
}
