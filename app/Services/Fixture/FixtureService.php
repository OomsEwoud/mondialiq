<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use App\Models\Round;
use App\Models\League;
use App\Models\Team;
use App\Models\Venue;
use App\Models\Referee;
use Carbon\Carbon;

class FixtureService
{
    public function storeFixtures(array $fixtures)
    {
        foreach ($fixtures as $fixture) {
            $refereeId = null;
            if (!empty($fixture['fixture']['referee'])) {
                $referee = Referee::firstOrCreate(
                    ['name' => $fixture['fixture']['referee']]
                );
                $refereeId = $referee->id;
            }



            $venueId = null;
            $vData = $fixture['fixture']['venue'];

            if ($vData['name']) {
                $venue = Venue::query()->when(!empty($vData['id']), function ($query) use ($vData) {
                    return $query->where('external_id', $vData['id']);
                }, function ($query) use ($vData) {
                    return $query->where('name', $vData['name']);
                })->first();

                if (!$venue) {
                    $venue = Venue::create([
                        'external_id' => $vData['id'],
                        'name'        => $vData['name'],
                        'city'        => $vData['city'] ?? null,
                    ]);
                }
                $venueId = $venue->id;
            }

            $result = null;
            $homeGoals = $fixture['score']['fulltime']['home'];
            $awayGoals = $fixture['score']['fulltime']['away'];

            if ($homeGoals !== null && $awayGoals !== null) {
                if ($homeGoals > $awayGoals) {
                    $result = 'H';
                } elseif ($homeGoals < $awayGoals) {
                    $result = 'A';
                } else {
                    $result = 'D';
                }
            }

            Fixture::updateOrCreate(
                ['external_id' => $fixture['fixture']['id']],
                [
                    'league_id' => League::where('external_id', $fixture['league']['id'])->first()->id,
                    'home_team_id' => Team::where('external_id', $fixture['teams']['home']['id'])->first()->id,
                    'away_team_id' => Team::where('external_id', $fixture['teams']['away']['id'])->first()->id,
                    'venue_id' => $venueId,
                    'referee_id' => $refereeId,
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
                    'penalty_home_goals'   => $fixture['score']['penalty']['home'],
                    'penalty_away_goals'   => $fixture['score']['penalty']['away'],
                    'result' => $result,
                ]
            );
        }
    }
}
