<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Standing;
use App\Models\Team;
use App\Services\Prediction\StandingsSummaryService;

test('it summarizes standings for both teams', function () {
    $fixture = createStandingsSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createStandingSummaryRow($fixture->homeTeam, $fixture->league, [
        'season' => $fixture->season,
        'rank' => 2,
        'points' => 74,
        'matches_played' => 33,
        'wins' => 22,
        'draws' => 8,
        'losses' => 3,
        'goals_for' => 78,
        'goals_against' => 36,
        'goal_difference' => 42,
        'group_name' => 'Premier League',
    ]);

    createStandingSummaryRow($fixture->awayTeam, $fixture->league, [
        'season' => $fixture->season,
        'rank' => 14,
        'points' => 38,
        'matches_played' => 33,
        'wins' => 10,
        'draws' => 8,
        'losses' => 15,
        'goals_for' => 41,
        'goals_against' => 53,
        'goal_difference' => -12,
        'group_name' => 'Premier League',
    ]);

    $summary = app(StandingsSummaryService::class)->summarize($fixture);

    expect($summary['home_team'])->toMatchArray([
        'team_name' => 'Liverpool',
        'rank' => 2,
        'points' => 74,
        'played' => 33,
        'wins' => 22,
        'draws' => 8,
        'losses' => 3,
        'goals_for' => 78,
        'goals_against' => 36,
        'goal_difference' => 42,
        'group_name' => 'Premier League',
    ])->and($summary['away_team'])->toMatchArray([
        'team_name' => 'Bournemouth',
        'rank' => 14,
        'points' => 38,
        'played' => 33,
        'wins' => 10,
        'draws' => 8,
        'losses' => 15,
        'goals_for' => 41,
        'goals_against' => 53,
        'goal_difference' => -12,
        'group_name' => 'Premier League',
    ]);
});

test('it handles one missing team standing', function () {
    $fixture = createStandingsSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createStandingSummaryRow($fixture->homeTeam, $fixture->league, [
        'season' => $fixture->season,
        'rank' => 2,
        'points' => 74,
        'goal_difference' => 42,
    ]);

    $summary = app(StandingsSummaryService::class)->summarize($fixture);

    expect($summary['home_team']['rank'])->toBe(2)
        ->and($summary['away_team'])->toMatchArray([
            'team_name' => 'Bournemouth',
            'rank' => null,
            'points' => null,
            'played' => null,
            'wins' => null,
            'draws' => null,
            'losses' => null,
            'goals_for' => null,
            'goals_against' => null,
            'goal_difference' => null,
            'group_name' => null,
        ]);
});

test('it handles all standings missing', function () {
    $fixture = createStandingsSummaryFixture();

    $summary = app(StandingsSummaryService::class)->summarize($fixture);

    expect($summary['home_team']['rank'])->toBeNull()
        ->and($summary['away_team']['rank'])->toBeNull();
});

test('it formats prompt block correctly', function () {
    $fixture = createStandingsSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createStandingSummaryRow($fixture->homeTeam, $fixture->league, [
        'season' => $fixture->season,
        'rank' => 2,
        'points' => 74,
        'goal_difference' => 42,
    ]);

    createStandingSummaryRow($fixture->awayTeam, $fixture->league, [
        'season' => $fixture->season,
        'rank' => 14,
        'points' => 38,
        'goal_difference' => -12,
    ]);

    $promptBlock = app(StandingsSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Standings summary:',
        '- Liverpool: 2nd, 74 points, +42 goal difference',
        '- Bournemouth: 14th, 38 points, -12 goal difference',
    ]));
});

test('it formats prompt block when standings are missing', function () {
    $fixture = createStandingsSummaryFixture();

    $promptBlock = app(StandingsSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Standings summary:',
        '- Standings data not available.',
    ]));
});

function createStandingSummaryRow(Team $team, League $league, array $overrides = []): Standing
{
    return Standing::query()->create([
        'team_id' => $team->id,
        'league_id' => $league->id,
        'season' => $overrides['season'] ?? config('services.api_football.season'),
        'group_name' => $overrides['group_name'] ?? 'Group A',
        'rank' => $overrides['rank'] ?? 1,
        'points' => $overrides['points'] ?? 0,
        'matches_played' => $overrides['matches_played'] ?? 0,
        'wins' => $overrides['wins'] ?? 0,
        'draws' => $overrides['draws'] ?? 0,
        'losses' => $overrides['losses'] ?? 0,
        'goals_for' => $overrides['goals_for'] ?? 0,
        'goals_against' => $overrides['goals_against'] ?? 0,
        'goal_difference' => $overrides['goal_difference'] ?? 0,
    ]);
}

function createStandingsSummaryFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => $overrides['league_external_id'] ?? fake()->unique()->numberBetween(1000, 9999),
        'name' => $overrides['league_name'] ?? 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => $overrides['home_team_external_id'] ?? fake()->unique()->numberBetween(10000, 19999),
        'name' => $overrides['home_team_name'] ?? 'Home Team',
        'code' => 'HOM',
        'logo_url' => 'https://example.com/home.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => $overrides['away_team_external_id'] ?? fake()->unique()->numberBetween(20000, 29999),
        'name' => $overrides['away_team_name'] ?? 'Away Team',
        'code' => 'AWY',
        'logo_url' => 'https://example.com/away.png',
    ]);

    return Fixture::query()->create([
        'external_id' => $overrides['external_id'] ?? fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Matchday 1',
        'season' => $overrides['season'] ?? config('services.api_football.season'),
        'match_date' => $overrides['match_date'] ?? now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);
}
