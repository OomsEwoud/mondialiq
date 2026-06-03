<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixturePlayerStatsService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

afterEach(fn () => Carbon::setTestNow());

test('the add fixture player stats command only syncs finished fixtures without synced player stats', function () {
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

    Fixture::create([
        'external_id' => 401,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addMinutes(30),
        'status_long' => 'Not Started',
    ]);

    Fixture::create([
        'external_id' => 402,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->subDay(),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    $finishedFixture = Fixture::create([
        'external_id' => 403,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->subHour(),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    Fixture::create([
        'external_id' => 404,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 4',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->subHour(),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'player_stats_synced_at' => now()->copy()->subMinutes(5),
        'player_stats_sync_attempts' => 1,
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($finishedFixture) {
        $mock->shouldReceive('getFixturePlayersStats')->once()->with($finishedFixture->external_id)->andReturn([]);
    });

    $this->mock(FixturePlayerStatsService::class, function (MockInterface $mock) use ($finishedFixture) {
        $mock->shouldReceive('storeFixturePlayerStats')->once()->with([], $finishedFixture->id);
    });

    $this->artisan('app:add-fixture-player-stats')
        ->expectsOutput('Ophalen van spelerstatistieken voor relevante fixtures')
        ->expectsOutput('1 relevante fixtures gevonden.')
        ->expectsOutput("Fetching player stats for fixture {$finishedFixture->id}: status FT")
        ->expectsOutput("Calling endpoint /fixtures/players for fixture {$finishedFixture->id}")
        ->expectsOutput('Spelerstatistieken voor relevante fixtures zijn geupdate')
        ->assertSuccessful();

    expect($finishedFixture->refresh()->player_stats_synced_at)->not->toBeNull()
        ->and($finishedFixture->player_stats_sync_attempts)->toBe(1);
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
