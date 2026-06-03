<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use Illuminate\Support\Facades\Cache;

beforeEach(fn () => Cache::flush());

test('the live fixtures endpoint returns slim cached live fixture data', function () {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 1001,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 1002,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 101,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->subMinutes(30),
        'status_short' => '2H',
        'status_long' => 'Second Half',
        'elapsed_time' => 70,
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
    ]);

    Fixture::create([
        'external_id' => 102,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addDay(),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $this->getJson('/api/live-fixtures')
        ->assertSuccessful()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $liveFixture->id)
        ->assertJsonPath('data.0.home_team.name', 'Belgium')
        ->assertJsonPath('data.0.home_team.code', 'BEL')
        ->assertJsonPath('data.0.away_team.name', 'Netherlands')
        ->assertJsonPath('data.0.away_team.code', 'NED')
        ->assertJsonPath('data.0.home_goals', 2)
        ->assertJsonPath('data.0.away_goals', 1)
        ->assertJsonPath('data.0.status_short', '2H')
        ->assertJsonPath('data.0.status_long', 'Second Half')
        ->assertJsonPath('data.0.elapsed_time', 70)
        ->assertJsonStructure([
            'data' => [
                [
                    'id',
                    'home_team' => ['id', 'name', 'code'],
                    'away_team' => ['id', 'name', 'code'],
                    'home_goals',
                    'away_goals',
                    'status_short',
                    'status_long',
                    'elapsed_time',
                    'updated_at',
                ],
            ],
        ]);
});

test('the live fixtures endpoint serves cached data for repeated requests', function () {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 2001,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 2002,
        'name' => 'Germany',
        'code' => 'GER',
        'logo_url' => 'https://example.com/germany.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 201,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->subMinutes(15),
        'status_short' => '1H',
        'status_long' => 'First Half',
        'elapsed_time' => 22,
        'fulltime_home_goals' => 0,
        'fulltime_away_goals' => 0,
    ]);

    $this->getJson('/api/live-fixtures')
        ->assertSuccessful()
        ->assertJsonPath('data.0.status_short', '1H')
        ->assertJsonPath('data.0.elapsed_time', 22);

    $fixture->update([
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'elapsed_time' => 90,
    ]);

    $this->getJson('/api/live-fixtures')
        ->assertSuccessful()
        ->assertJsonPath('data.0.status_short', '1H')
        ->assertJsonPath('data.0.elapsed_time', 22);

    Cache::forget('live-fixtures');

    $this->getJson('/api/live-fixtures')
        ->assertSuccessful()
        ->assertJsonCount(0, 'data');
});
