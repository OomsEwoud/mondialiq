<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixturePlayerStatsService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

afterEach(fn () => Carbon::setTestNow());

test('the add fixture player stats command only syncs relevant fixtures', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 3001,
        'name' => 'Croatia',
        'code' => 'CRO',
        'logo_url' => 'https://example.com/croatia.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 3002,
        'name' => 'Uruguay',
        'code' => 'URU',
        'logo_url' => 'https://example.com/uruguay.png',
    ]);

    $soonFixture = Fixture::create([
        'external_id' => 401,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addMinutes(30),
        'status_long' => 'Not Started',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 402,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->subDay(),
        'status_long' => 'First Half',
    ]);

    Fixture::create([
        'external_id' => 403,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('getFixturePlayersStats')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixturePlayersStats')->once()->with($soonFixture->external_id)->andReturn([]);
    });

    $this->mock(FixturePlayerStatsService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeFixturePlayerStats')->once()->with([], $liveFixture->id);
        $mock->shouldReceive('storeFixturePlayerStats')->once()->with([], $soonFixture->id);
    });

    $this->artisan('app:add-fixture-player-stats')
        ->expectsOutput('Ophalen van spelerstatistieken voor relevante fixtures')
        ->expectsOutput('2 relevante fixtures gevonden.')
        ->expectsOutput('Spelerstatistieken voor relevante fixtures zijn geupdate')
        ->assertSuccessful();
});

test('the add fixture player stats command returns early when no relevant fixtures are found', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 3101,
        'name' => 'Mexico',
        'code' => 'MEX',
        'logo_url' => 'https://example.com/mexico.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 3102,
        'name' => 'Japan',
        'code' => 'JPN',
        'logo_url' => 'https://example.com/japan.png',
    ]);

    Fixture::create([
        'external_id' => 404,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('getFixturePlayersStats');
    });

    $this->mock(FixturePlayerStatsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixturePlayerStats'));

    $this->artisan('app:add-fixture-player-stats')
        ->expectsOutput('Ophalen van spelerstatistieken voor relevante fixtures')
        ->expectsOutput('Geen relevante fixtures gevonden voor spelerstatistieken sync.')
        ->assertSuccessful();
});
