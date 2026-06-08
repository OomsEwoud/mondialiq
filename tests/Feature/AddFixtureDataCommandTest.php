<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureService;
use App\Services\Fixture\FixtureStatsService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

beforeEach(function () {
    config(['app.timezone' => 'Europe/Brussels']);
});

afterEach(function () {
    Carbon::setTestNow();
    config(['app.timezone' => 'UTC']);
});

test('the relevant fixture data sync scope includes upcoming live and unfinished final fixtures', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

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

    $finishedWithoutFinalSyncFixture = Fixture::create([
        'external_id' => 301,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(20),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    $upcomingFixture = Fixture::create([
        'external_id' => 302,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->addMinutes(10),
        'status_long' => 'Not Started',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 303,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subDay(),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    $finishedSyncedFixture = Fixture::create([
        'external_id' => 304,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Round of 16',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(30),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'final_data_synced_at' => now('Europe/Brussels')->subMinutes(5),
        'final_data_sync_attempts' => 1,
    ]);

    $finishedMaxAttemptsFixture = Fixture::create([
        'external_id' => 305,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Quarter-final',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(40),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'final_data_sync_attempts' => 3,
    ]);

    $recentlyStartedNsFixture = Fixture::create([
        'external_id' => 306,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Semi-final',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(10),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $farPastNsFixture = Fixture::create([
        'external_id' => 307,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Round of 32',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subHours(4),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $relevantFixtureIds = Fixture::query()
        ->whereNotNull('external_id')
        ->relevantForFixtureDataSync()
        ->orderBy('match_date')
        ->pluck('external_id');

    expect($relevantFixtureIds->all())->toBe([
        $liveFixture->external_id,
        $finishedWithoutFinalSyncFixture->external_id,
        $recentlyStartedNsFixture->external_id,
        $upcomingFixture->external_id,
    ]);

    expect($relevantFixtureIds)
        ->not->toContain($finishedSyncedFixture->external_id)
        ->not->toContain($finishedMaxAttemptsFixture->external_id)
        ->not->toContain($farPastNsFixture->external_id);
});

test('recently started ns fixtures respect the basic data retry cutoff', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 908,
        'name' => 'Brazil',
        'code' => 'BRA',
        'logo_url' => 'https://example.com/brazil.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 909,
        'name' => 'Argentina',
        'code' => 'ARG',
        'logo_url' => 'https://example.com/argentina.png',
    ]);

    $recentlyStartedSyncedRecently = Fixture::create([
        'external_id' => 310,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 5',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(10),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
        'fixture_basics_synced_at' => now('Europe/Brussels')->subMinutes(5),
    ]);

    $recentlyStartedSyncedLongAgo = Fixture::create([
        'external_id' => 311,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 6',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(20),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
        'fixture_basics_synced_at' => now('Europe/Brussels')->subMinutes(70),
    ]);

    $relevantFixtureIds = Fixture::query()
        ->whereNotNull('external_id')
        ->relevantForDataSync()
        ->pluck('external_id')
        ->all();

    expect($relevantFixtureIds)->not->toContain($recentlyStartedSyncedRecently->external_id)
        ->toContain($recentlyStartedSyncedLongAgo->external_id);
});

test('the relevant fixture data sync scope includes fixtures with in progress live statuses', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 903,
        'name' => 'Mexico',
        'code' => 'MEX',
        'logo_url' => 'https://example.com/mexico.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 904,
        'name' => 'Canada',
        'code' => 'CAN',
        'logo_url' => 'https://example.com/canada.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 308,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 4',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->subMinutes(5),
        'status_long' => 'Penalty In Progress',
    ]);

    $relevantFixtureIds = Fixture::query()
        ->whereNotNull('external_id')
        ->relevantForDataSync()
        ->pluck('external_id')
        ->all();

    expect($relevantFixtureIds)->toContain($fixture->external_id);
});

test('fixtures recognize the api football live and finished short statuses', function () {
    foreach (['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE'] as $statusShort) {
        $fixture = new Fixture([
            'status_short' => $statusShort,
            'status_long' => 'Not Started',
        ]);

        expect($fixture->isLive())->toBeTrue("Expected {$statusShort} to be live");
    }

    foreach (['FT', 'AET', 'PEN'] as $statusShort) {
        $fixture = new Fixture([
            'status_short' => $statusShort,
            'status_long' => 'Not Started',
        ]);

        expect($fixture->isFinished())->toBeTrue("Expected {$statusShort} to be finished");
    }
});

test('the add fixture data command only syncs relevant fixtures', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

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
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(10),
        'status_long' => 'Not Started',
    ]);

    $liveFixture = Fixture::create([
        'external_id' => 102,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->copy()->subDay(),
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
        'match_date' => now('Europe/Brussels')->copy()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('getFixture')->once()->with($liveFixture->external_id)->andReturn([
            fixtureSyncPayload($liveFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, '2H', 'Second Half', 70),
        ]);
        $mock->shouldReceive('getFixtureStats')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureEvents')->once()->with($liveFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixture')->once()->with($soonFixture->external_id)->andReturn([
            fixtureSyncPayload($soonFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'NS', 'Not Started', null),
        ]);
    });

    $this->mock(FixtureService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('storeFixtures')
            ->once()
            ->with([
                fixtureSyncPayload($liveFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, '2H', 'Second Half', 70),
            ])
            ->andReturnUsing(function () use ($liveFixture): array {
                $liveFixture->forceFill([
                    'status_short' => '2H',
                    'status_long' => 'Second Half',
                    'elapsed_time' => 70,
                ])->save();

                return ['imported' => 1, 'skipped' => 0, 'lazy_teams_created' => 0];
            });

        $mock->shouldReceive('storeFixtures')
            ->once()
            ->with([
                fixtureSyncPayload($soonFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'NS', 'Not Started', null),
            ])
            ->andReturnUsing(function () use ($soonFixture): array {
                $soonFixture->forceFill([
                    'status_short' => 'NS',
                    'status_long' => 'Not Started',
                    'elapsed_time' => null,
                    'match_date' => now('Europe/Brussels')->copy()->addMinutes(10),
                ])->save();

                return ['imported' => 1, 'skipped' => 0, 'lazy_teams_created' => 0];
            });
    });

    $this->mock(FixtureStatsService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeFixtureStats')->once()->with([], $liveFixture->id);
        $mock->shouldNotReceive('storeFixtureStats')->with([], $soonFixture->id);
    });

    $this->mock(FixtureEventsService::class, function (MockInterface $mock) use ($soonFixture, $liveFixture) {
        $mock->shouldReceive('storeFixtureEvents')->once()->with([], $liveFixture->id);
        $mock->shouldNotReceive('storeFixtureEvents')->with([], $soonFixture->id);
    });

    $this->artisan('app:add-fixture-data')
        ->assertSuccessful();
});

test('the add fixture data command continues when one fixture fails', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 1101,
        'name' => 'Morocco',
        'code' => 'MAR',
        'logo_url' => 'https://example.com/morocco.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 1102,
        'name' => 'Tunisia',
        'code' => 'TUN',
        'logo_url' => 'https://example.com/tunisia.png',
    ]);

    $failingFixture = Fixture::create([
        'external_id' => 111,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(5),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $successfulFixture = Fixture::create([
        'external_id' => 112,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(10),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($failingFixture, $successfulFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('getFixture')
            ->once()
            ->with($failingFixture->external_id)
            ->andThrow(new RuntimeException('temporary api failure'));

        $mock->shouldReceive('getFixture')
            ->once()
            ->with($successfulFixture->external_id)
            ->andReturn([
                fixtureSyncPayload($successfulFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'NS', 'Not Started', null),
            ]);
    });

    $this->mock(FixtureService::class, function (MockInterface $mock) use ($successfulFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('storeFixtures')
            ->once()
            ->with([
                fixtureSyncPayload($successfulFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'NS', 'Not Started', null),
            ])
            ->andReturn(['imported' => 1, 'skipped' => 0, 'lazy_teams_created' => 0]);
    });

    $this->mock(FixtureStatsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureStats'));
    $this->mock(FixtureEventsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureEvents'));

    $this->artisan('app:add-fixture-data')
        ->assertSuccessful();
});

test('the add fixture data command fetches final data once for finished fixtures', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 20, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 4001,
        'name' => 'Argentina',
        'code' => 'ARG',
        'logo_url' => 'https://example.com/argentina.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 4002,
        'name' => 'Italy',
        'code' => 'ITA',
        'logo_url' => 'https://example.com/italy.png',
    ]);

    $finishedFixture = Fixture::create([
        'external_id' => 401,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->copy()->subHour(),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'elapsed_time' => 90,
    ]);

    Fixture::create([
        'external_id' => 402,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => now('Europe/Brussels')->copy()->subHour(),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'elapsed_time' => 90,
        'final_data_synced_at' => now('Europe/Brussels')->copy()->subMinutes(5),
        'final_data_sync_attempts' => 1,
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($finishedFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('getFixture')->once()->with($finishedFixture->external_id)->andReturn([
            fixtureSyncPayload($finishedFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'FT', 'Match Finished', 90),
        ]);
        $mock->shouldReceive('getFixtureStats')->once()->with($finishedFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureEvents')->once()->with($finishedFixture->external_id)->andReturn([]);
    });

    $this->mock(FixtureService::class, function (MockInterface $mock) use ($finishedFixture, $homeTeam, $awayTeam) {
        $mock->shouldReceive('storeFixtures')
            ->once()
            ->with([
                fixtureSyncPayload($finishedFixture->external_id, 2026, $homeTeam->external_id, $awayTeam->external_id, 'FT', 'Match Finished', 90),
            ])
            ->andReturn(['imported' => 1, 'skipped' => 0, 'lazy_teams_created' => 0]);
    });

    $this->mock(FixtureStatsService::class, fn (MockInterface $mock) => $mock->shouldReceive('storeFixtureStats')->once()->with([], $finishedFixture->id));
    $this->mock(FixtureEventsService::class, fn (MockInterface $mock) => $mock->shouldReceive('storeFixtureEvents')->once()->with([], $finishedFixture->id));

    $this->artisan('app:add-fixture-data')
        ->expectsOutput('1 relevante fixtures gevonden.')
        ->expectsOutput("Fixture {$finishedFixture->id} (external {$finishedFixture->external_id}) sync state [status_short=FT | status_long=Match Finished | elapsed_time=90 | isLive=false | isFinished=true | shouldSyncFinalData=true]")
        ->expectsOutput("Fetching final data for fixture {$finishedFixture->id}: status FT")
        ->assertSuccessful();

    expect($finishedFixture->refresh()->final_data_synced_at)->not->toBeNull()
        ->and($finishedFixture->final_data_sync_attempts)->toBe(1);
});

test('the add fixture data command returns early when no relevant fixtures are found', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

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
        'match_date' => now('Europe/Brussels')->copy()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('getFixture');
        $mock->shouldNotReceive('getFixtureStats');
        $mock->shouldNotReceive('getFixtureEvents');
    });

    $this->mock(FixtureService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtures'));
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
