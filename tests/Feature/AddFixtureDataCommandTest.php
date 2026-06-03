<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixtureService;
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
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    $recentKnockoutFixture = Fixture::create([
        'external_id' => 304,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Round of 16',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->subHours(2),
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
        $recentFixture->external_id,
        $recentKnockoutFixture->external_id,
        $upcomingFixture->external_id,
        $upcomingKnockoutFixture->external_id,
        307,
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
        'status_short' => '1H',
        'status_long' => 'First Half',
        'elapsed_time' => 45,
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

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('getFixture')->once()->with($liveFixture->external_id)->andReturn([
            fixtureSyncPayload($liveFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, '2H', 'Second Half', 70),
        ]);
        $mock->shouldReceive('getFixtureLineups')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureStats')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureEvents')->once()->with($liveFixture->external_id)->andReturn([]);

        $mock->shouldReceive('getFixture')->once()->with($soonFixture->external_id)->andReturn([
            fixtureSyncPayload($soonFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'NS', 'Not Started', null),
        ]);
        $mock->shouldReceive('getFixtureLineups')->once()->with($soonFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureStats')->once()->with($soonFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureEvents')->once()->with($soonFixture->external_id)->andReturn([]);
    });

    $this->mock(FixtureService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('storeFixtures')
            ->once()
            ->with([
                fixtureSyncPayload($liveFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, '2H', 'Second Half', 70),
            ])
            ->andReturnUsing(function () use ($liveFixture): void {
                $liveFixture->forceFill([
                    'status_short' => '2H',
                    'status_long' => 'Second Half',
                    'elapsed_time' => 70,
                ])->save();
            });

        $mock->shouldReceive('storeFixtures')
            ->once()
            ->with([
                fixtureSyncPayload($soonFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'NS', 'Not Started', null),
            ])
            ->andReturnUsing(function () use ($soonFixture): void {
                $soonFixture->forceFill([
                    'status_short' => 'NS',
                    'status_long' => 'Not Started',
                    'elapsed_time' => null,
                ])->save();
            });
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
        ->expectsOutput(" - Fixture {$liveFixture->id} (external {$liveFixture->external_id}) geselecteerd [1H | First Half | elapsed 45]")
        ->expectsOutput(" - Fixture {$soonFixture->id} (external {$soonFixture->external_id}) geselecteerd [- | Not Started | elapsed -]")
        ->expectsOutput("Fixture {$liveFixture->id} oud [1H | First Half | elapsed 45]")
        ->expectsOutput("Fixture {$liveFixture->id} nieuw [2H | Second Half | elapsed 70]")
        ->expectsOutput("Fixture {$soonFixture->id} oud [- | Not Started | elapsed -]")
        ->expectsOutput("Fixture {$soonFixture->id} nieuw [NS | Not Started | elapsed -]")
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
        $mock->shouldNotReceive('getFixture');
        $mock->shouldNotReceive('getFixtureLineups');
        $mock->shouldNotReceive('getFixtureStats');
        $mock->shouldNotReceive('getFixtureEvents');
    });

    $this->mock(FixtureService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtures'));
    $this->mock(FixtureLineupService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeLineups'));
    $this->mock(FixtureStatsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureStats'));
    $this->mock(FixtureEventsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureEvents'));

    $this->artisan('app:add-fixture-data')
        ->expectsOutput('Ophalen van fixture data voor relevante fixtures')
        ->expectsOutput('Geen relevante fixtures gevonden voor fixture data sync.')
        ->assertSuccessful();
});

function fixtureSyncPayload(
    int $fixtureId,
    int $season,
    int $homeTeamId,
    int $awayTeamId,
    string $statusShort,
    string $statusLong,
    ?int $elapsedTime,
): array {
    return [
        'fixture' => [
            'id' => $fixtureId,
            'referee' => null,
            'date' => '2026-06-12T18:00:00+00:00',
            'venue' => [
                'id' => 0,
                'name' => 'Example Stadium',
                'city' => 'Example City',
            ],
            'status' => [
                'short' => $statusShort,
                'long' => $statusLong,
                'elapsed' => $elapsedTime,
            ],
        ],
        'league' => [
            'id' => config('services.api_football.league_id'),
            'season' => $season,
            'round' => 'Group Stage - Matchday 1',
        ],
        'teams' => [
            'home' => ['id' => $homeTeamId],
            'away' => ['id' => $awayTeamId],
        ],
        'score' => [
            'halftime' => ['home' => null, 'away' => null],
            'fulltime' => ['home' => null, 'away' => null],
            'extratime' => ['home' => null, 'away' => null],
            'penalty' => ['home' => null, 'away' => null],
        ],
    ];
}
