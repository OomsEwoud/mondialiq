<?php

use App\Models\Fixture;
use App\Models\HeadToHead;
use App\Models\League;
use App\Models\Team;
use App\Services\Prediction\HeadToHeadSummaryService;

test('it maps head to head data to home and away perspective', function () {
    $fixture = createHeadToHeadSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createHeadToHeadSummaryRow($fixture->homeTeam, $fixture->awayTeam, [
        'total_matches' => 8,
        'team_a_wins' => 6,
        'team_b_wins' => 1,
        'draws' => 1,
        'team_a_goals' => 18,
        'team_b_goals' => 7,
        'last_meeting_at' => '2025-12-10 20:00:00',
    ]);

    $summary = app(HeadToHeadSummaryService::class)->summarize($fixture);

    expect($summary)->toMatchArray([
        'total_meetings' => 8,
        'home_team_h2h_wins' => 6,
        'away_team_h2h_wins' => 1,
        'draws' => 1,
        'home_team_h2h_goals' => 18,
        'away_team_h2h_goals' => 7,
        'last_meeting_date' => '2025-12-10',
        'conclusion' => 'Liverpool has the stronger head-to-head record.',
    ]);
});

test('it handles reversed teams correctly', function () {
    $fixture = createHeadToHeadSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createHeadToHeadSummaryRow($fixture->homeTeam, $fixture->awayTeam, [
        'total_matches' => 8,
        'team_a_wins' => 6,
        'team_b_wins' => 1,
        'draws' => 1,
        'team_a_goals' => 18,
        'team_b_goals' => 7,
        'last_meeting_at' => '2025-12-10 20:00:00',
    ]);

    $originalHomeTeamId = $fixture->home_team_id;
    $fixture->home_team_id = $fixture->away_team_id;
    $fixture->away_team_id = $originalHomeTeamId;
    $fixture->unsetRelation('homeTeam');
    $fixture->unsetRelation('awayTeam');

    $summary = app(HeadToHeadSummaryService::class)->summarize($fixture);

    expect($summary['home_team_h2h_wins'])->toBe(1)
        ->and($summary['away_team_h2h_wins'])->toBe(6)
        ->and($summary['home_team_h2h_goals'])->toBe(7)
        ->and($summary['away_team_h2h_goals'])->toBe(18)
        ->and($summary['conclusion'])->toBe('Liverpool has the stronger head-to-head record.');
});

test('it handles missing head to head data', function () {
    $fixture = createHeadToHeadSummaryFixture();

    $summary = app(HeadToHeadSummaryService::class)->summarize($fixture);

    expect($summary)->toBe([
        'total_meetings' => null,
        'home_team_h2h_wins' => null,
        'away_team_h2h_wins' => null,
        'draws' => null,
        'home_team_h2h_goals' => null,
        'away_team_h2h_goals' => null,
        'last_meeting_date' => null,
        'conclusion' => null,
    ]);
});

test('it formats prompt block correctly', function () {
    $fixture = createHeadToHeadSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createHeadToHeadSummaryRow($fixture->homeTeam, $fixture->awayTeam, [
        'total_matches' => 8,
        'team_a_wins' => 6,
        'team_b_wins' => 1,
        'draws' => 1,
        'team_a_goals' => 18,
        'team_b_goals' => 7,
        'last_meeting_at' => '2025-12-10 20:00:00',
    ]);

    $promptBlock = app(HeadToHeadSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Head-to-head summary:',
        '- Total meetings: 8',
        '- Liverpool wins: 6',
        '- Bournemouth wins: 1',
        '- Draws: 1',
        '- Goals: Liverpool 18 - 7 Bournemouth',
        '- Last meeting: 2025-12-10',
    ]));
});

test('it formats prompt block when head to head data is missing', function () {
    $fixture = createHeadToHeadSummaryFixture();

    $promptBlock = app(HeadToHeadSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Head-to-head summary:',
        '- Head-to-head data not available.',
    ]));
});

function createHeadToHeadSummaryRow(Team $teamA, Team $teamB, array $overrides = []): HeadToHead
{
    return HeadToHead::query()->create([
        'team_a_id' => $teamA->id,
        'team_b_id' => $teamB->id,
        'pair_key' => headToHeadSummaryPairKey($teamA->id, $teamB->id),
        'total_matches' => $overrides['total_matches'] ?? 0,
        'team_a_wins' => $overrides['team_a_wins'] ?? 0,
        'team_b_wins' => $overrides['team_b_wins'] ?? 0,
        'draws' => $overrides['draws'] ?? 0,
        'team_a_goals' => $overrides['team_a_goals'] ?? 0,
        'team_b_goals' => $overrides['team_b_goals'] ?? 0,
        'last_meeting_at' => $overrides['last_meeting_at'] ?? null,
        'fetched_at' => $overrides['fetched_at'] ?? now('UTC'),
    ]);
}

function createHeadToHeadSummaryFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => $overrides['league_external_id'] ?? fake()->unique()->numberBetween(1000, 9999),
        'name' => 'Premier League',
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

function headToHeadSummaryPairKey(int $teamAId, int $teamBId): string
{
    return $teamAId < $teamBId
        ? "{$teamAId}-{$teamBId}"
        : "{$teamBId}-{$teamAId}";
}
