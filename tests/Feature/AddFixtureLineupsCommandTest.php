<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureLineupService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

afterEach(fn () => Carbon::setTestNow());

test('the add fixture lineups command only fetches lineups inside the retry window', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

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
        'match_date' => now()->copy()->addMinutes(48),
    ]);

    $recentlyCheckedFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 502,
        'match_date' => now()->copy()->addMinutes(70),
        'lineups_synced_at' => now()->copy()->subMinutes(5),
    ]);

    $syncedFixture = createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 503,
        'match_date' => now()->copy()->addMinutes(60),
        'has_lineups' => true,
    ]);

    createLineupFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 504,
        'match_date' => now()->copy()->addHours(2),
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
        ->expectsOutput('Ophalen van lineups voor fixtures dicht bij de aftrap')
        ->expectsOutput('3 lineup kandidaten gevonden.')
        ->expectsOutput("Fetching lineups for fixture {$lineupFixture->id}: BRA vs ENG, kickoff in 48 minutes")
        ->expectsOutput("Calling endpoint /fixtures/lineups for fixture {$lineupFixture->id}")
        ->expectsOutput("Skipping fixture {$syncedFixture->id}: lineups already synced")
        ->expectsOutput("Skipping fixture {$recentlyCheckedFixture->id}: lineups checked recently")
        ->expectsOutput('Lineup sync afgerond')
        ->assertSuccessful();

    expect($lineupFixture->refresh()->has_lineups)->toBeTrue()
        ->and($lineupFixture->lineups_synced_at)->not->toBeNull()
        ->and($lineupFixture->lineup_sync_attempts)->toBe(1);
});

test('the add fixture lineups command retries later when lineups are unavailable', function () {
    Carbon::setTestNow('2026-06-12 18:00:00');

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
        'match_date' => now()->copy()->addMinutes(60),
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
