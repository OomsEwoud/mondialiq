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
        $leagueIds = League::pluck('id', 'external_id');
        $teamIds = Team::pluck('id', 'external_id');

        foreach ($fixtures as $fixture) {
            Fixture::updateOrCreate(
                ['external_id' => $fixture['fixture']['id']],
                [
                    'league_id' => $leagueIds[$fixture['league']['id']],
                    'home_team_id' => $teamIds[$fixture['teams']['home']['id']],
                    'away_team_id' => $teamIds[$fixture['teams']['away']['id']],
                    'venue_id' => $this->resolveVenue($fixture['fixture']['venue']),
                    'referee_id' => $this->resolveReferee($fixture['fixture']),
                    'round_name' => $fixture['league']['round'],
                    'season' => $fixture['league']['season'],
                    'match_date' => Carbon::parse($fixture['fixture']['date']),
                    'status_long' => $fixture['fixture']['status']['long'],
                    'elapsed_time' => $fixture['fixture']['status']['elapsed'],
                    'halftime_home_goals' => $fixture['score']['halftime']['home'],
                    'halftime_away_goals' => $fixture['score']['halftime']['away'],
                    'fulltime_home_goals' => $fixture['score']['fulltime']['home'],
                    'fulltime_away_goals' => $fixture['score']['fulltime']['away'],
                    'extratime_home_goals' => $fixture['score']['extratime']['home'],
                    'extratime_away_goals' => $fixture['score']['extratime']['away'],
                    'penalty_home_goals' => $fixture['score']['penalty']['home'],
                    'penalty_away_goals' => $fixture['score']['penalty']['away'],
                    'result' => $this->calculateResult($fixture['score']['fulltime']),
                ]
            );
        }
    }

    private function resolveReferee(array $fixtureData): ?int
    {
        if (empty($fixtureData['referee'])) {
            return null;
        }

        return Referee::firstOrCreate(['name' => $fixtureData['referee']])->id;
    }

    private function resolveVenue(array $venueData): ?int
    {
        if (empty($venueData['name'])) {
            return null;
        }

        $venue = !empty($venueData['id'])
            ? Venue::where('external_id', $venueData['id'])->first()
            : Venue::where('name', $venueData['name'])->first();

        if (!$venue) {
            $venue = Venue::create([
                'external_id' => $venueData['id'] ?? null,
                'name' => $venueData['name'],
                'city' => $venueData['city'] ?? null,
            ]);
        }

        return $venue->id;
    }

    private function calculateResult(array $fulltime): ?string
    {
        if ($fulltime['home'] === null || $fulltime['away'] === null) {
            return null;
        }

        if ($fulltime['home'] > $fulltime['away']) {
            return 'H';
        }

        if ($fulltime['home'] < $fulltime['away']) {
            return 'A';
        }

        return 'D';
    }
}
