<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureLineupService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

beforeEach(function () {
    config(['app.timezone' => 'Europe/Brussels']);
});

afterEach(function () {
    Carbon::setTestNow();
    config(['app.timezone' => 'UTC']);
});

test('the lineup sync scope extends the fixture data sync scope with the lineup window', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 4901,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 4902,
        'name' => 'Tunisia',
        'code' => 'TUN',
        'logo_url' => 'https://example.com/tunisia.png',
    ]);

    $liveFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 491,
        'match_date' => now('Europe/Brussels')->copy()->subDay(),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    $lineupWindowFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 492,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(40),
    ]);

    $nearKickoffWithUnexpectedStatusFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 494,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(3),
        'status_short' => 'TBD',
        'status_long' => 'Time to be defined',
    ]);

    createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 493,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(46),
    ]);

    $fixtureIds = Fixture::query()
        ->whereNotNull('external_id')
        ->relevantForLineupSync()
        ->orderBy('match_date')
        ->pluck('external_id')
        ->all();

    $lineupWindowOnlyIds = Fixture::query()
        ->whereNotNull('external_id')
        ->lineupSyncWindow()
        ->pluck('external_id')
        ->all();

    $dataSyncOnlyIds = Fixture::query()
        ->whereNotNull('external_id')
        ->relevantForDataSync()
        ->pluck('external_id')
        ->all();

    expect($lineupWindowOnlyIds)->toContain($lineupWindowFixture->external_id, $nearKickoffWithUnexpectedStatusFixture->external_id)
        ->and($dataSyncOnlyIds)->toContain($liveFixture->external_id)
        ->and($fixtureIds)->toBe([
            $liveFixture->external_id,
            $nearKickoffWithUnexpectedStatusFixture->external_id,
            $lineupWindowFixture->external_id,
        ]);
});

test('the lineup sync window uses Brussels time consistently', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 4951,
        'name' => 'Brazil',
        'code' => 'BRA',
        'logo_url' => 'https://example.com/brazil.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 4952,
        'name' => 'England',
        'code' => 'ENG',
        'logo_url' => 'https://example.com/england.png',
    ]);

    $withinFutureWindow = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 495,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(45),
    ]);

    $beyondFutureWindow = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 496,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(46),
    ]);

    $withinPastWindow = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 497,
        'match_date' => now('Europe/Brussels')->copy()->subMinutes(15),
        'status_short' => '1H',
        'status_long' => 'First Half',
        'elapsed_time' => 15,
    ]);

    $beyondPastWindow = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 498,
        'match_date' => now('Europe/Brussels')->copy()->subMinutes(16),
        'status_short' => '1H',
        'status_long' => 'First Half',
        'elapsed_time' => 16,
    ]);

    expect($withinFutureWindow->shouldSyncLineups())->toBeTrue();
    expect($beyondFutureWindow->shouldSyncLineups())
        ->toBeFalse()
        ->and($beyondFutureWindow->lineupSyncSkipReason())
        ->toBe('fixture starts too far in the future');
    expect($withinPastWindow->shouldSyncLineups())->toBeTrue();
    expect($beyondPastWindow->shouldSyncLineups())
        ->toBeFalse()
        ->and($beyondPastWindow->lineupSyncSkipReason())
        ->toBe('live fixture is beyond the lineup sync window');
});

test('the add fixture lineups command only fetches lineups inside the retry window', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5001,
        'name' => 'Brazil',
        'code' => 'BRA',
        'logo_url' => 'https://example.com/brazil.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5002,
        'name' => 'England',
        'code' => 'ENG',
        'logo_url' => 'https://example.com/england.png',
    ]);

    $lineupFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 501,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(40),
    ]);

    $recentlyCheckedFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 502,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(35),
        'lineups_synced_at' => now('Europe/Brussels')->copy()->subMinutes(4),
    ]);

    $syncedFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 503,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(42),
        'has_lineups' => true,
    ]);

    createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 504,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(46),
    ]);

    $lineups = [
        ['team' => ['id' => $homeTeam->external_id], 'formation' => '4-3-3'],
        ['team' => ['id' => $awayTeam->external_id], 'formation' => '4-2-3-1'],
    ];

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($lineupFixture, $lineups) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($lineupFixture->external_id)->andReturn($lineups);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($lineupFixture, $lineups) {
        $mock->shouldReceive('storeLineups')->once()->with($lineups, $lineupFixture->id)->andReturn(true);
    });

    $this->artisan('app:add-fixture-lineups')
        ->assertSuccessful();

    expect($lineupFixture->refresh()->has_lineups)->toBeTrue()
        ->and($lineupFixture->lineups_synced_at)->not->toBeNull()
        ->and($lineupFixture->lineup_sync_attempts)->toBe(1);
});

test('the add fixture lineups command retries later when lineups are unavailable', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5101,
        'name' => 'Spain',
        'code' => 'ESP',
        'logo_url' => 'https://example.com/spain.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5102,
        'name' => 'Portugal',
        'code' => 'POR',
        'logo_url' => 'https://example.com/portugal.png',
    ]);

    $fixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 511,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(40),
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($fixture) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($fixture->external_id)->andReturn([]);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($fixture) {
        $mock->shouldReceive('storeLineups')->once()->with([], $fixture->id)->andReturn(false);
    });

    $this->artisan('app:add-fixture-lineups')
        ->expectsOutput("No lineups available for fixture {$fixture->id}; will retry later")
        ->assertSuccessful();

    expect($fixture->refresh()->has_lineups)->toBeFalse()
        ->and($fixture->lineups_synced_at)->not->toBeNull()
        ->and($fixture->lineup_sync_attempts)->toBe(1);
});

test('the add fixture lineups command fetches live fixtures shortly after kickoff', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5201,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5202,
        'name' => 'Germany',
        'code' => 'GER',
        'logo_url' => 'https://example.com/germany.png',
    ]);

    $fixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 521,
        'match_date' => now('Europe/Brussels')->copy()->subMinutes(5),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);

    $lineups = [
        ['team' => ['id' => $homeTeam->external_id], 'formation' => '4-3-3'],
    ];

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($fixture->external_id)->andReturn($lineups);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('storeLineups')->once()->with($lineups, $fixture->id)->andReturn(true);
    });

    $this->artisan('app:add-fixture-lineups')
        ->assertSuccessful();

    expect($fixture->refresh()->has_lineups)->toBeTrue()
        ->and($fixture->lineup_sync_attempts)->toBe(1);
});

test('the add fixture lineups command skips live fixtures beyond the lineup window', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5251,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5252,
        'name' => 'Tunisia',
        'code' => 'TUN',
        'logo_url' => 'https://example.com/tunisia.png',
    ]);

    $fixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 525,
        'match_date' => now('Europe/Brussels')->copy()->subHour(),
        'status_short' => '2H',
        'status_long' => 'Second Half',
        'elapsed_time' => 60,
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('getFixtureLineups');
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('storeLineups');
    });

    $this->artisan('app:add-fixture-lineups')
        ->assertSuccessful();

    expect($fixture->refresh()->has_lineups)->toBeFalse()
        ->and($fixture->lineup_sync_attempts)->toBe(0);
});

test('the add fixture lineups command keeps retrying after previous unavailable attempts', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5301,
        'name' => 'Argentina',
        'code' => 'ARG',
        'logo_url' => 'https://example.com/argentina.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5302,
        'name' => 'Japan',
        'code' => 'JPN',
        'logo_url' => 'https://example.com/japan.png',
    ]);

    $fixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 531,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(20),
        'lineup_sync_attempts' => 12,
        'lineups_synced_at' => now('Europe/Brussels')->copy()->subMinutes(20),
    ]);

    $lineups = [
        ['team' => ['id' => $homeTeam->external_id], 'formation' => '4-4-2'],
    ];

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($fixture->external_id)->andReturn($lineups);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('storeLineups')->once()->with($lineups, $fixture->id)->andReturn(true);
    });

    $this->artisan('app:add-fixture-lineups')
        ->expectsOutput("Calling endpoint /fixtures/lineups for fixture {$fixture->id}")
        ->assertSuccessful();

    expect($fixture->refresh()->has_lineups)->toBeTrue()
        ->and($fixture->lineup_sync_attempts)->toBe(13);
});

test('the add fixture lineups command retries quickly near kickoff after an unavailable check', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5351,
        'name' => 'Croatia',
        'code' => 'CRO',
        'logo_url' => 'https://example.com/croatia.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5352,
        'name' => 'Ireland',
        'code' => 'IRE',
        'logo_url' => 'https://example.com/ireland.png',
    ]);

    $fixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 535,
        'match_date' => now('Europe/Brussels')->copy()->addMinutes(20),
        'lineups_synced_at' => now('Europe/Brussels')->copy()->subMinutes(2),
    ]);

    $lineups = [
        ['team' => ['id' => $homeTeam->external_id], 'formation' => '4-3-3'],
    ];

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($fixture->external_id)->andReturn($lineups);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('storeLineups')->once()->with($lineups, $fixture->id)->andReturn(true);
    });

    $this->artisan('app:add-fixture-lineups')
        ->assertSuccessful();

    expect($fixture->refresh()->has_lineups)->toBeTrue()
        ->and($fixture->lineup_sync_attempts)->toBe(1);
});

test('the add fixture lineups command fetches recently finished fixtures that missed lineup sync', function () {
    Carbon::setTestNow(Carbon::create(2026, 6, 12, 18, 0, 0, 'Europe/Brussels'));

    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5501,
        'name' => 'Uruguay',
        'code' => 'URU',
        'logo_url' => 'https://example.com/uruguay.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5502,
        'name' => 'Serbia',
        'code' => 'SRB',
        'logo_url' => 'https://example.com/serbia.png',
    ]);

    $fixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 551,
        'match_date' => now('Europe/Brussels')->copy()->subMinutes(10),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    $lineups = [
        ['team' => ['id' => $homeTeam->external_id], 'formation' => '3-5-2'],
    ];

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('getFixtureLineups')->once()->with($fixture->external_id)->andReturn($lineups);
    });

    $this->mock(FixtureLineupService::class, function (MockInterface $mock) use ($fixture, $lineups) {
        $mock->shouldReceive('storeLineups')->once()->with($lineups, $fixture->id)->andReturn(true);
    });

    $this->artisan('app:add-fixture-lineups')
        ->assertSuccessful();

    expect($fixture->refresh()->has_lineups)->toBeTrue();
});

function createLineupFixture(League $league, Team $homeTeam, Team $awayTeam, array $attributes): Fixture
{
    return Fixture::create([
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
        ...$attributes,
    ]);
}
