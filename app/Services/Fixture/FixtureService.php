<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\League;
use App\Models\Referee;
use App\Models\Team;
use App\Models\Venue;
use Carbon\Carbon;

class FixtureService
{
    public function storeFixtures(array $fixtures): void
    {
        $leagueIds = League::query()->pluck('id', 'external_id');
        $teamIds = Team::query()->pluck('id', 'external_id');

        foreach ($fixtures as $fixture) {
            $externalId = data_get($fixture, 'fixture.id');
            $leagueId = $leagueIds[data_get($fixture, 'league.id')] ?? null;
            $homeTeamId = $teamIds[data_get($fixture, 'teams.home.id')] ?? null;
            $awayTeamId = $teamIds[data_get($fixture, 'teams.away.id')] ?? null;

            if ($externalId === null || $leagueId === null || $homeTeamId === null || $awayTeamId === null) {
                continue;
            }

            Fixture::query()->updateOrCreate(
                ['external_id' => $externalId],
                [
                    'league_id' => $leagueId,
                    'home_team_id' => $homeTeamId,
                    'away_team_id' => $awayTeamId,
                    'venue_id' => $this->resolveVenue(data_get($fixture, 'fixture.venue', [])),
                    'referee_id' => $this->resolveReferee(data_get($fixture, 'fixture', [])),
                    'round_name' => data_get($fixture, 'league.round'),
                    'season' => data_get($fixture, 'league.season'),
                    'match_date' => Carbon::parse(data_get($fixture, 'fixture.date')),
                    'status_long' => data_get($fixture, 'fixture.status.long'),
                    'elapsed_time' => data_get($fixture, 'fixture.status.elapsed'),
                    'halftime_home_goals' => data_get($fixture, 'score.halftime.home'),
                    'halftime_away_goals' => data_get($fixture, 'score.halftime.away'),
                    'fulltime_home_goals' => data_get($fixture, 'score.fulltime.home'),
                    'fulltime_away_goals' => data_get($fixture, 'score.fulltime.away'),
                    'extratime_home_goals' => data_get($fixture, 'score.extratime.home'),
                    'extratime_away_goals' => data_get($fixture, 'score.extratime.away'),
                    'penalty_home_goals' => data_get($fixture, 'score.penalty.home'),
                    'penalty_away_goals' => data_get($fixture, 'score.penalty.away'),
                    'result' => $this->calculateResult(data_get($fixture, 'score.fulltime', [])),
                ],
            );
        }
    }

    private function resolveReferee(array $fixtureData): ?int
    {
        if (empty($fixtureData['referee'])) {
            return null;
        }

        return Referee::query()->firstOrCreate(['name' => $fixtureData['referee']])->id;
    }

    private function resolveVenue(array $venueData): ?int
    {
        if (empty($venueData['name'])) {
            return null;
        }

        $externalId = $this->venueExternalId($venueData);

        $venue = $externalId !== null
            ? Venue::query()->where('external_id', $externalId)->first()
            : Venue::query()
                ->where('name', $venueData['name'])
                ->where('city', $venueData['city'] ?? null)
                ->first();

        if (! $venue) {
            $venue = Venue::query()->create([
                'external_id' => $externalId,
                'name' => $venueData['name'],
                'city' => $venueData['city'] ?? null,
            ]);
        }

        return $venue->id;
    }

    private function venueExternalId(array $venueData): ?int
    {
        $externalId = $venueData['id'] ?? null;

        if (! is_numeric($externalId) || (int) $externalId <= 0) {
            return null;
        }

        return (int) $externalId;
    }

    private function calculateResult(array $fulltime): ?string
    {
        $homeGoals = $fulltime['home'] ?? null;
        $awayGoals = $fulltime['away'] ?? null;

        if ($homeGoals === null || $awayGoals === null) {
            return null;
        }

        if ($homeGoals > $awayGoals) {
            return 'H';
        }

        if ($homeGoals < $awayGoals) {
            return 'A';
        }

        return 'D';
    }
}
