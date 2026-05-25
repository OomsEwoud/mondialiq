<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\Prediction\TeamStatsSummaryService;

test('it calculates recent form score from the last five form characters', function () {
    $fixture = createTeamStatsSummaryFixture();

    createTeamSummaryStatistic($fixture->homeTeam, $fixture->league, [
        'season' => $fixture->season,
        'form' => 'LWWDWL',
        'fixtures_played_total' => 33,
        'wins_total' => 20,
        'draws_total' => 8,
        'losses_total' => 5,
        'goals_for_total' => 66,
        'goals_against_total' => 31,
    ]);

    $summary = app(TeamStatsSummaryService::class)->summarize($fixture);

    expect($summary['home_team']['form'])->toBe('LWWDWL')
        ->and($summary['home_team']['recent_form_score'])->toBe(10)
        ->and($summary['home_team']['fixtures_played'])->toBe(33)
        ->and($summary['home_team']['wins'])->toBe(20)
        ->and($summary['home_team']['draws'])->toBe(8)
        ->and($summary['home_team']['losses'])->toBe(5)
        ->and($summary['home_team']['win_percentage'])->toBe(60.61)
        ->and($summary['home_team']['goals_for'])->toBe(66)
        ->and($summary['home_team']['goals_against'])->toBe(31)
        ->and($summary['home_team']['goal_difference'])->toBe(35)
        ->and($summary['home_team']['average_goals_for'])->toBe(2.0)
        ->and($summary['home_team']['average_goals_against'])->toBe(0.94);
});

test('it handles missing form', function () {
    $fixture = createTeamStatsSummaryFixture();

    createTeamSummaryStatistic($fixture->homeTeam, $fixture->league, [
        'season' => $fixture->season,
        'form' => null,
        'fixtures_played_total' => 10,
        'wins_total' => 4,
        'draws_total' => 3,
        'losses_total' => 3,
    ]);

    $summary = app(TeamStatsSummaryService::class)->summarize($fixture);

    expect($summary['home_team']['form'])->toBeNull()
        ->and($summary['home_team']['recent_form_score'])->toBeNull()
        ->and($summary['home_team']['win_percentage'])->toBe(40.0);
});

test('it handles missing team statistics', function () {
    $fixture = createTeamStatsSummaryFixture();

    $summary = app(TeamStatsSummaryService::class)->summarize($fixture);

    expect($summary['home_team']['team_name'])->toBe($fixture->homeTeam->name)
        ->and($summary['home_team']['form'])->toBeNull()
        ->and($summary['home_team']['recent_form_score'])->toBeNull()
        ->and($summary['home_team']['fixtures_played'])->toBeNull()
        ->and($summary['away_team']['team_name'])->toBe($fixture->awayTeam->name)
        ->and($summary['away_team']['form'])->toBeNull()
        ->and($summary['away_team']['fixtures_played'])->toBeNull();
});

test('it formats prompt block safely', function () {
    $fixture = createTeamStatsSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    createTeamSummaryStatistic($fixture->homeTeam, $fixture->league, [
        'season' => $fixture->season,
        'form' => 'WWDWL',
        'wins_total' => 20,
        'draws_total' => 8,
        'losses_total' => 5,
    ]);

    createTeamSummaryStatistic($fixture->awayTeam, $fixture->league, [
        'season' => $fixture->season,
        'form' => 'LDWLL',
        'wins_total' => 9,
        'draws_total' => 6,
        'losses_total' => 18,
    ]);

    $promptBlock = app(TeamStatsSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Team statistics summary:',
        '- Liverpool form: W-W-D-W-L, recent form score 10/15',
        '- Liverpool record: 20W 8D 5L',
        '- Bournemouth form: L-D-W-L-L, recent form score 4/15',
        '- Bournemouth record: 9W 6D 18L',
    ]));
});

test('it formats prompt block when statistics are missing', function () {
    $fixture = createTeamStatsSummaryFixture([
        'home_team_name' => 'Liverpool',
        'away_team_name' => 'Bournemouth',
    ]);

    $promptBlock = app(TeamStatsSummaryService::class)->promptBlock($fixture);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'Team statistics summary:',
        '- Liverpool form: not available',
        '- Liverpool record: not available',
        '- Bournemouth form: not available',
        '- Bournemouth record: not available',
    ]));
});

function createTeamSummaryStatistic(Team $team, League $league, array $overrides = []): TeamStatistic
{
    $season = $overrides['season'] ?? config('services.api_football.season');

    return TeamStatistic::query()->create([
        'team_id' => $team->id,
        'league_id' => $league->id,
        'api_team_id' => $team->external_id,
        'api_league_id' => $league->external_id,
        'season' => $season,
        'statistics_key' => $overrides['statistics_key'] ?? "{$team->external_id}-{$league->external_id}-{$season}-season",
        'statistics_date' => $overrides['statistics_date'] ?? null,
        'form' => array_key_exists('form', $overrides) ? $overrides['form'] : 'WWWWW',
        'fixtures_played_total' => $overrides['fixtures_played_total'] ?? 0,
        'wins_total' => $overrides['wins_total'] ?? 0,
        'draws_total' => $overrides['draws_total'] ?? 0,
        'losses_total' => $overrides['losses_total'] ?? 0,
        'goals_for_total' => $overrides['goals_for_total'] ?? 0,
        'goals_against_total' => $overrides['goals_against_total'] ?? 0,
        'goals_for_avg_total' => $overrides['goals_for_avg_total'] ?? null,
        'goals_against_avg_total' => $overrides['goals_against_avg_total'] ?? null,
        'fetched_at' => $overrides['fetched_at'] ?? now('UTC'),
    ]);
}

function createTeamStatsSummaryFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => $overrides['league_external_id'] ?? fake()->unique()->numberBetween(1000, 9999),
        'name' => 'World Cup',
        'type' => 'Cup',
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
        'round_name' => 'Group Stage - Matchday 1',
        'season' => $overrides['season'] ?? config('services.api_football.season'),
        'match_date' => $overrides['match_date'] ?? now('UTC')->addDay(),
        'status_long' => 'Not Started',
    ]);
}
