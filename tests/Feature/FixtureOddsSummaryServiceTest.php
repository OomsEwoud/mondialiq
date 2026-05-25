<?php

use App\Models\BetType;
use App\Models\Bookmaker;
use App\Models\Fixture;
use App\Models\FixtureOdd;
use App\Models\League;
use App\Models\Team;
use App\Services\Prediction\FixtureOddsSummaryService;

test('fixture odds summary calculates normalized market probabilities', function () {
    $fixture = createOddsSummaryFixture();

    createSummaryOdd($fixture, 'Match Winner', 'Home', 2.00);
    createSummaryOdd($fixture, 'Match Winner', 'Draw', 3.50);
    createSummaryOdd($fixture, 'Match Winner', 'Away', 4.00);
    createSummaryOdd($fixture, 'Goals Over/Under', 'Over 2.5', 1.80);
    createSummaryOdd($fixture, 'Goals Over/Under', 'Under 2.5', 2.05);
    createSummaryOdd($fixture, 'Both Teams Score', 'Yes', 1.90);
    createSummaryOdd($fixture, 'Both Teams Score', 'No', 1.95);
    createSummaryOdd($fixture, 'Exact Score', '1-0', 6.00);
    createSummaryOdd($fixture, 'Exact Score', '1-1', 6.50);
    createSummaryOdd($fixture, 'Exact Score', '2-1', 8.00);
    createSummaryOdd($fixture, 'Corners Over Under', 'Over 8.5', 1.80);

    $summary = app(FixtureOddsSummaryService::class)->summarize($fixture);

    expect($summary['home_win_probability'])->toBe(48.28)
        ->and($summary['draw_probability'])->toBe(27.59)
        ->and($summary['away_win_probability'])->toBe(24.14)
        ->and($summary['over_2_5_probability'])->toBe(53.25)
        ->and($summary['under_2_5_probability'])->toBe(46.75)
        ->and($summary['btts_yes_probability'])->toBe(50.65)
        ->and($summary['btts_no_probability'])->toBe(49.35)
        ->and($summary['most_likely_score'])->toBe('1-0')
        ->and($summary['top_scores'])->toBe([
            ['score' => '1-0', 'probability' => 37.41],
            ['score' => '1-1', 'probability' => 34.53],
            ['score' => '2-1', 'probability' => 28.06],
        ]);
});

test('fixture odds summary averages normalized probabilities across bookmakers', function () {
    $fixture = createOddsSummaryFixture();

    createSummaryOdd($fixture, 'Match Winner', 'Home', 2.00, bookmakerName: 'Bet365', externalBookmakerId: 8);
    createSummaryOdd($fixture, 'Match Winner', 'Draw', 3.50, bookmakerName: 'Bet365', externalBookmakerId: 8);
    createSummaryOdd($fixture, 'Match Winner', 'Away', 4.00, bookmakerName: 'Bet365', externalBookmakerId: 8);
    createSummaryOdd($fixture, 'Match Winner', 'Home', 1.90, bookmakerName: 'Unibet', externalBookmakerId: 16);
    createSummaryOdd($fixture, 'Match Winner', 'Draw', 3.80, bookmakerName: 'Unibet', externalBookmakerId: 16);
    createSummaryOdd($fixture, 'Match Winner', 'Away', 4.10, bookmakerName: 'Unibet', externalBookmakerId: 16);

    $summary = app(FixtureOddsSummaryService::class)->summarize($fixture->id);

    expect($summary['home_win_probability'])->toBe(49.6)
        ->and($summary['draw_probability'])->toBe(26.53)
        ->and($summary['away_win_probability'])->toBe(23.87);
});

test('fixture odds summary can resolve markets through bet types', function () {
    $fixture = createOddsSummaryFixture();
    $bookmaker = Bookmaker::query()->create(['name' => 'Bet365']);
    $betType = BetType::query()->create(['name' => 'Match Winner']);

    foreach ([['Home', 2.00], ['Draw', 3.50], ['Away', 4.00]] as [$value, $odd]) {
        FixtureOdd::query()->create([
            'fixture_id' => $fixture->id,
            'bookmaker_id' => $bookmaker->id,
            'bet_type_id' => $betType->id,
            'value' => $value,
            'odd' => $odd,
        ]);
    }

    $summary = app(FixtureOddsSummaryService::class)->summarize($fixture);

    expect($summary['home_win_probability'])->toBe(48.28)
        ->and($summary['draw_probability'])->toBe(27.59)
        ->and($summary['away_win_probability'])->toBe(24.14);
});

test('fixture odds summary returns null probabilities when odds are missing', function () {
    $fixture = createOddsSummaryFixture();

    $summary = app(FixtureOddsSummaryService::class)->summarize($fixture);

    expect($summary)->toBe([
        'home_win_probability' => null,
        'draw_probability' => null,
        'away_win_probability' => null,
        'over_2_5_probability' => null,
        'under_2_5_probability' => null,
        'btts_yes_probability' => null,
        'btts_no_probability' => null,
        'most_likely_score' => null,
        'top_scores' => [],
    ]);
});

function createSummaryOdd(
    Fixture $fixture,
    string $market,
    string $value,
    float $odd,
    string $bookmakerName = 'Bet365',
    int $externalBookmakerId = 8,
): FixtureOdd {
    $bookmaker = Bookmaker::query()->firstOrCreate(['name' => $bookmakerName]);
    $betType = BetType::query()->firstOrCreate(['name' => $market]);

    return FixtureOdd::query()->create([
        'fixture_id' => $fixture->id,
        'external_bookmaker_id' => $externalBookmakerId,
        'bookmaker_name' => $bookmakerName,
        'external_bet_id' => abs(crc32($market)),
        'bet_name' => $market,
        'bookmaker_id' => $bookmaker->id,
        'bet_type_id' => $betType->id,
        'value' => $value,
        'odd' => $odd,
    ]);
}

function createOddsSummaryFixture(array $overrides = []): Fixture
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
