<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixtureStatsService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

afterEach(fn () => Carbon::setTestNow());

test('the relevant fixture data sync scope includes fixtures inside the configured sync windows', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 901,
        'name' => 'Spain',
        'code' => 'ESP',
        'logo_url' => 'https://example.com/spain.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 902,
        'name' => 'Portugal',
        'code' => 'POR',
        'logo_url' => 'https://example.com/portugal.png',
    ]);

    $recentFixture = Fixture::create([
        'external_id' => 301,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->subHours(2),
        'status_long' => 'Finished',
    ]);

    $upcomingFixture = Fixture::create([
        'external_id' => 302,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addMinutes(30),
        'status_long' => 'Not Started',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 303,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->subDay(),
        'status_long' => 'First Half',
    ]);

    $recentKnockoutFixture = Fixture::create([
        'external_id' => 304,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Round of 16',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->subHours(4),
        'status_long' => 'Finished',
    ]);

    $upcomingKnockoutFixture = Fixture::create([
        'external_id' => 305,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Quarter-final',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addHour(),
        'status_long' => 'Not Started',
    ]);

    Fixture::create([
        'external_id' => 306,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Semi-final',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->subHours(13),
        'status_long' => 'Finished',
    ]);

    Fixture::create([
        'external_id' => 307,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Final',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addMinutes(121),
        'status_long' => 'Not Started',
    ]);

    $relevantFixtureIds = Fixture::query()
        ->whereNotNull('external_id')
        ->relevantForDataSync()
        ->orderBy('match_date')
        ->pluck('external_id');

    expect($relevantFixtureIds->all())->toBe([
        $liveFixture->external_id,
        $recentKnockoutFixture->external_id,
        $recentFixture->external_id,
        $upcomingFixture->external_id,
        $upcomingKnockoutFixture->external_id,
    ]);
});

test('the add fixture data command only syncs relevant fixtures', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

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

    $soonFixture = Fixture::create([
        'external_id' => 101,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addMinutes(30),
        'status_long' => 'Not Started',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 102,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->subDay(),
        'status_long' => 'First Half',
    ]);

    Fixture::create([
        'external_id' => 103,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureStats')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureEvents')->once()->with($liveFixture->external_id)->andReturn([]);

        $mock->shouldReceive('getFixtureLineups')->once()->with($soonFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureStats')->once()->with($soonFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureEvents')->once()->with($soonFixture->external_id)->andReturn([]);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeLineups')->once()->with([], $liveFixture->id);
        $mock->shouldReceive('storeLineups')->once()->with([], $soonFixture->id);
    });

    $this->mock(FixtureStatsService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeFixtureStats')->once()->with([], $liveFixture->id);
        $mock->shouldReceive('storeFixtureStats')->once()->with([], $soonFixture->id);
    });

    $this->mock(FixtureEventsService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeFixtureEvents')->once()->with([], $liveFixture->id);
        $mock->shouldReceive('storeFixtureEvents')->once()->with([], $soonFixture->id);
    });

    $this->artisan('app:add-fixture-data')
        ->expectsOutput('Ophalen van fixture data voor relevante fixtures')
        ->expectsOutput('2 relevante fixtures gevonden.')
        ->expectsOutput('Fixture data voor relevante fixtures is geupdate')
        ->assertSuccessful();
});

test('the add fixture data command returns early when no relevant fixtures are found', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

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

    Fixture::create([
        'external_id' => 201,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->copy()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('getFixtureLineups');
        $mock->shouldNotReceive('getFixtureStats');
        $mock->shouldNotReceive('getFixtureEvents');
    });

    $this->mock(FixtureLineupService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeLineups'));
    $this->mock(FixtureStatsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureStats'));
    $this->mock(FixtureEventsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureEvents'));

    $this->artisan('app:add-fixture-data')
        ->expectsOutput('Ophalen van fixture data voor relevante fixtures')
        ->expectsOutput('Geen relevante fixtures gevonden voor fixture data sync.')
        ->assertSuccessful();
});
