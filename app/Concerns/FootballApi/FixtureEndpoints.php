<?php

namespace App\Concerns\FootballApi;

trait FixtureEndpoints
{
    public function getFixturesInWindow(int $leagueId, int $season, string $from, string $to): array
    {
        return $this->call('/fixtures', [
            'league' => $leagueId, 'season' => $season, 'from' => $from, 'to' => $to, 'timezone' => 'Europe/Brussels',
        ]);
    }

    public function getFixturesByIds(array $fixtureIds): array
    {
        if ($fixtureIds === [] || count($fixtureIds) > 20) {
            throw new \InvalidArgumentException('Fixture batches require between 1 and 20 IDs.');
        }

        return $this->call('/fixtures', [
            'ids' => implode('-', array_unique(array_map('intval', $fixtureIds))),
            'timezone' => 'Europe/Brussels',
        ]);
    }

    public function getFixtures(int $leagueId, int $season): array
    {
        return $this->call('/fixtures', [
            'league' => $leagueId,
            'season' => $season,
            'timezone' => 'Europe/Brussels',
        ]);
    }

    public function getFixture(int $fixtureId): array
    {
        return $this->call('/fixtures', [
            'id' => $fixtureId,
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
