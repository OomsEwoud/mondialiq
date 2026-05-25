<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureOddsService;
use Illuminate\Support\Carbon;
use Mockery\MockInterface;

afterEach(fn () => Carbon::setTestNow());

test('the add odds command only syncs fixtures in the next 14 days by default', function () {
    Carbon::setTestNow('2026-06-01 12:00:00');

    $upcomingFixture = createCommandOddsFixture([
        'external_id' => 601,
        'match_date' => now('UTC')->addDays(3),
    ]);

    createCommandOddsFixture([
        'external_id' => 602,
        'match_date' => now('UTC')->subDay(),
    ]);

    createCommandOddsFixture([
        'external_id' => 603,
        'match_date' => now('UTC')->addDays(15),
    ]);

    createCommandOddsFixture([
        'external_id' => null,
        'match_date' => now('UTC')->addDays(2),
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($upcomingFixture) {
        $mock->shouldReceive('getFixtureOdds')->once()->with($upcomingFixture->external_id)->andReturn([]);
    });

    $this->mock(FixtureOddsService::class, function (MockInterface $mock) use ($upcomingFixture) {
        $mock->shouldReceive('storeFixtureOdds')->once()->with([], $upcomingFixture->id)->andReturn([
            'stored' => 0,
            'skipped' => 0,
        ]);
    });

    $this->artisan('app:add-odds')
        ->expectsOutput('Starten met ophalen van fixture odds')
        ->expectsOutput('1 fixtures gevonden binnen het odds venster.')
        ->expectsOutput('Fixture odds sync klaar')
        ->assertSuccessful();
});

test('the add odds command can include recent fixtures with option', function () {
    Carbon::setTestNow('2026-06-01 12:00:00');

    $recentFixture = createCommandOddsFixture([
        'external_id' => 604,
        'match_date' => now('UTC')->subDays(6),
    ]);

    $upcomingFixture = createCommandOddsFixture([
        'external_id' => 605,
        'match_date' => now('UTC')->addDay(),
    ]);

    createCommandOddsFixture([
        'external_id' => 606,
        'match_date' => now('UTC')->subDays(8),
    ]);

    $this->mock(FootballApiService::class, function (MockInterface $mock) use ($recentFixture, $upcomingFixture) {
        $mock->shouldReceive('getFixtureOdds')->once()->with($recentFixture->external_id)->andReturn([]);
        $mock->shouldReceive('getFixtureOdds')->once()->with($upcomingFixture->external_id)->andReturn([]);
    });

    $this->mock(FixtureOddsService::class, function (MockInterface $mock) use ($recentFixture, $upcomingFixture) {
        $mock->shouldReceive('storeFixtureOdds')->once()->with([], $recentFixture->id)->andReturn([
            'stored' => 0,
            'skipped' => 0,
        ]);
        $mock->shouldReceive('storeFixtureOdds')->once()->with([], $upcomingFixture->id)->andReturn([
            'stored' => 0,
            'skipped' => 0,
        ]);
    });

    $this->artisan('app:add-odds --include-recent')
        ->expectsOutput('Starten met ophalen van fixture odds')
        ->expectsOutput('2 fixtures gevonden binnen het odds venster.')
        ->expectsOutput('Fixture odds sync klaar')
        ->assertSuccessful();
});

test('the add odds command returns early when no fixtures are in the odds window', function () {
    Carbon::setTestNow('2026-06-01 12:00:00');

    createCommandOddsFixture([
        'external_id' => 607,
        'match_date' => now('UTC')->addDays(20),
    ]);

    $this->mock(FootballApiService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('getFixtureOdds'));
    $this->mock(FixtureOddsService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('storeFixtureOdds'));

    $this->artisan('app:add-odds')
        ->expectsOutput('Starten met ophalen van fixture odds')
        ->expectsOutput('Geen fixtures gevonden binnen het odds venster.')
        ->assertSuccessful();
});

function createCommandOddsFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(40000, 49999),
        'name' => fake()->unique()->word(),
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(50000, 59999),
        'name' => fake()->unique()->word(),
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(60000, 69999),
        'name' => fake()->unique()->word(),
        'code' => 'AWY',
        'logo_url' => 'https://example.com/away.png',
    ]);

    $externalId = array_key_exists('external_id', $overrides)
        ? $overrides['external_id']
        : fake()->unique()->numberBetween(70000, 79999);

    return Fixture::query()->create([
        'external_id' => $externalId,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => $overrides['match_date'] ?? now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);
}
