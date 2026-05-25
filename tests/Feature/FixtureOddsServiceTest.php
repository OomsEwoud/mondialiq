<?php

use App\Models\Fixture;
use App\Models\FixtureOdd;
use App\Models\League;
use App\Models\Team;
use App\Services\Fixture\FixtureOddsService;

test('fixture odds service stores important markets from nested api response', function () {
    $fixture = createOddsFixture();
    $service = app(FixtureOddsService::class);

    $summary = $service->storeFixtureOdds(fixtureOddsResponse(), $fixture->id);

    expect($summary)->toBe([
        'stored' => 3,
        'skipped' => 1,
    ]);

    expect(FixtureOdd::query()->count())->toBe(3);

    $this->assertDatabaseHas('fixture_odds', [
        'fixture_id' => $fixture->id,
        'external_bookmaker_id' => 8,
        'bookmaker_name' => 'Bet365',
        'external_bet_id' => 1,
        'bet_name' => 'Match Winner',
        'value' => 'Home',
        'odd' => 1.85,
    ]);
});

test('fixture odds service updates duplicate odds instead of creating duplicates', function () {
    $fixture = createOddsFixture();
    $service = app(FixtureOddsService::class);

    $service->storeFixtureOdds(fixtureOddsResponse('1.85'), $fixture->id);
    $service->storeFixtureOdds(fixtureOddsResponse('1.95'), $fixture->id);

    expect(FixtureOdd::query()->count())->toBe(3);

    $this->assertDatabaseHas('fixture_odds', [
        'fixture_id' => $fixture->id,
        'external_bookmaker_id' => 8,
        'external_bet_id' => 1,
        'value' => 'Home',
        'odd' => 1.95,
    ]);
});

test('fixture odds service safely handles empty response', function () {
    $fixture = createOddsFixture();
    $service = app(FixtureOddsService::class);

    $summary = $service->storeFixtureOdds([], $fixture->id);

    expect($summary)->toBe([
        'stored' => 0,
        'skipped' => 0,
    ]);

    expect(FixtureOdd::query()->count())->toBe(0);
});

test('fixture odds service skips invalid and missing odds', function () {
    $fixture = createOddsFixture();
    $service = app(FixtureOddsService::class);

    $summary = $service->storeFixtureOdds([
        [
            'update' => '2026-06-01T10:00:00+00:00',
            'bookmakers' => [
                [
                    'id' => 8,
                    'name' => 'Bet365',
                    'bets' => [
                        [
                            'id' => 1,
                            'name' => 'Match Winner',
                            'values' => [
                                ['value' => 'Home', 'odd' => null],
                                ['value' => 'Draw', 'odd' => 'not-a-number'],
                                ['value' => 'Away', 'odd' => '0'],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ], $fixture->id);

    expect($summary)->toBe([
        'stored' => 0,
        'skipped' => 3,
    ]);

    expect(FixtureOdd::query()->count())->toBe(0);
});

function fixtureOddsResponse(string $homeOdd = '1.85'): array
{
    return [
        [
            'update' => '2026-06-01T10:00:00+00:00',
            'bookmakers' => [
                [
                    'id' => 8,
                    'name' => 'Bet365',
                    'bets' => [
                        [
                            'id' => 1,
                            'name' => 'Match Winner',
                            'values' => [
                                ['value' => 'Home', 'odd' => $homeOdd],
                                ['value' => 'Draw', 'odd' => '3.40'],
                                ['value' => 'Away', 'odd' => '4.20'],
                            ],
                        ],
                        [
                            'id' => 44,
                            'name' => 'Corners Over Under',
                            'values' => [
                                ['value' => 'Over 8.5', 'odd' => '1.90'],
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ];
}

function createOddsFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(1000, 9999),
        'name' => fake()->unique()->word(),
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(10000, 19999),
        'name' => fake()->unique()->word(),
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(20000, 29999),
        'name' => fake()->unique()->word(),
        'code' => 'AWY',
        'logo_url' => 'https://example.com/away.png',
    ]);

    return Fixture::query()->create([
        'external_id' => $overrides['external_id'] ?? fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => $overrides['match_date'] ?? now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);
}
