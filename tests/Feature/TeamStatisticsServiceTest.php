<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\Apis\FootballApiService;
use App\Services\TeamStatisticsService;
use Mockery\MockInterface;

beforeEach(function () {
    $this->league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $this->team = Team::create([
        'external_id' => 501,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $this->opponent = Team::create([
        'external_id' => 502,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);
});

test('parse statistics maps response safely', function () {
    $service = app(TeamStatisticsService::class);

    $parsed = $service->parseStatistics([
        'form' => 'WLD',
        'fixtures' => [
            'played' => ['home' => 1, 'away' => 2, 'total' => 3],
            'wins' => ['home' => 1, 'away' => 0, 'total' => 1],
            'draws' => ['home' => 0, 'away' => 1, 'total' => 1],
            'loses' => ['home' => 0, 'away' => 1, 'total' => 1],
        ],
        'goals' => [
            'for' => [
                'total' => ['home' => 2, 'away' => 1, 'total' => 3],
                'average' => ['home' => '2.0', 'away' => '0.5', 'total' => '1.0'],
                'minute' => ['0-15' => ['total' => 1, 'percentage' => '33.33%']],
            ],
            'against' => [
                'total' => ['home' => 0, 'away' => 2, 'total' => 2],
                'average' => ['home' => '0.0', 'away' => '1.0', 'total' => '0.67'],
                'minute' => ['16-30' => ['total' => 1, 'percentage' => '50%']],
            ],
        ],
        'clean_sheet' => ['home' => 1, 'away' => 0, 'total' => 1],
        'failed_to_score' => ['home' => 0, 'away' => 1, 'total' => 1],
        'biggest' => [
            'streak' => ['wins' => 2, 'draws' => 1, 'loses' => 1],
        ],
        'lineups' => [
            ['formation' => '4-3-3', 'played' => 2],
            ['formation' => '3-4-3', 'played' => 1],
        ],
        'cards' => ['yellow' => ['0-15' => ['total' => 1]]],
    ], $this->team->external_id, $this->league->external_id, 2026, '2026-06-11');

    expect($parsed['form'])->toBe('WLD')
        ->and($parsed['fixtures_played_total'])->toBe(3)
        ->and($parsed['wins_total'])->toBe(1)
        ->and($parsed['goals_for_avg_total'])->toBe(1.0)
        ->and($parsed['goals_against_avg_total'])->toBe(0.67)
        ->and($parsed['most_used_formation'])->toBe('4-3-3')
        ->and($parsed['goals_by_minute']['for'])->toBeArray()
        ->and($parsed['goals_by_minute']['against'])->toBeArray();
});

test('form score is calculated as percentage of maximum points', function () {
    $statistic = new TeamStatistic([
        'form' => 'WLD',
        'goals_for_avg_total' => 0.3,
        'clean_sheets_total' => 1,
        'fixtures_played_total' => 3,
    ]);

    expect($statistic->formScore())->toBe(44.44)
        ->and($statistic->recentFormScore())->toBe(44.44)
        ->and($statistic->attackStrength())->toBe(0.3)
        ->and($statistic->defensiveStrength())->toBe(33.33);
});

test('refresh policy uses 24 hours for teams with a fixture today', function () {
    Fixture::create([
        'external_id' => 7001,
        'league_id' => $this->league->id,
        'home_team_id' => $this->team->id,
        'away_team_id' => $this->opponent->id,
        'round_name' => 'Group Stage',
        'season' => 2026,
        'match_date' => now('UTC'),
        'status_long' => 'Not Started',
    ]);

    $existing = new TeamStatistic(['fetched_at' => now()->subHours(25)]);

    $service = app(TeamStatisticsService::class);

    expect($service->teamHasFixtureToday($this->team->external_id, $this->league->external_id, 2026))->toBeTrue()
        ->and($service->shouldRefresh($existing, true))->toBeTrue()
        ->and($service->shouldRefresh(new TeamStatistic(['fetched_at' => now()->subHours(23)]), true))->toBeFalse();
});

test('refresh policy uses 7 days for teams without a fixture today', function () {
    $service = app(TeamStatisticsService::class);

    expect($service->shouldRefresh(new TeamStatistic(['fetched_at' => now()->subDays(8)]), false))->toBeTrue()
        ->and($service->shouldRefresh(new TeamStatistic(['fetched_at' => now()->subDays(6)]), false))->toBeFalse();
});

test('null safe parsing and import do not crash on empty api response', function () {
    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('getTeamStatistics')
            ->once()
            ->with($this->team->external_id, $this->league->external_id, 2026, null)
            ->andReturn([]);
    });

    $statistic = app(TeamStatisticsService::class)->importForTeam(
        $this->team->external_id,
        $this->league->external_id,
        2026,
        null,
        true,
    );

    expect($statistic->fixtures_played_total)->toBe(0)
        ->and($statistic->form)->toBeNull()
        ->and($statistic->raw_data)->toBe([]);
});
