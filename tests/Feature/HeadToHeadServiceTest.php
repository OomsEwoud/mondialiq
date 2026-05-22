<?php

use App\Models\HeadToHead;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\HeadToHeadService;
use Mockery\MockInterface;

beforeEach(function () {
    $this->teamA = Team::create([
        'external_id' => 101,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $this->teamB = Team::create([
        'external_id' => 202,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);
});

test('pair key normalization sorts team ids', function () {
    $service = app(HeadToHeadService::class);

    expect($service->makePairKey($this->teamB->id, $this->teamA->id))
        ->toBe("{$this->teamA->id}-{$this->teamB->id}");
});

test('calculate summary only counts finished matches', function () {
    $service = app(HeadToHeadService::class);

    $summary = $service->calculateSummary([
        [
            'fixture' => [
                'date' => '2026-06-12T20:00:00+00:00',
                'status' => ['short' => 'FT'],
            ],
            'teams' => [
                'home' => ['id' => $this->teamA->external_id],
                'away' => ['id' => $this->teamB->external_id],
            ],
            'goals' => [
                'home' => 2,
                'away' => 1,
            ],
        ],
        [
            'fixture' => [
                'date' => '2026-06-20T20:00:00+00:00',
                'status' => ['short' => 'NS'],
            ],
            'teams' => [
                'home' => ['id' => $this->teamB->external_id],
                'away' => ['id' => $this->teamA->external_id],
            ],
            'goals' => [
                'home' => null,
                'away' => null,
            ],
        ],
    ], $this->teamA->id, $this->teamB->id);

    expect($summary['total_matches'])->toBe(1)
        ->and($summary['team_a_wins'])->toBe(1)
        ->and($summary['team_b_wins'])->toBe(0)
        ->and($summary['draws'])->toBe(0)
        ->and($summary['team_a_goals'])->toBe(2)
        ->and($summary['team_b_goals'])->toBe(1)
        ->and($summary['last_meeting_at']?->toIso8601String())->toBe('2026-06-12T20:00:00+00:00');
});

test('calculate summary counts wins draws and goals from normalized team perspective', function () {
    $service = app(HeadToHeadService::class);

    $summary = $service->calculateSummary([
        [
            'fixture' => [
                'date' => '2026-06-01T20:00:00+00:00',
                'status' => ['short' => 'FT'],
            ],
            'teams' => [
                'home' => ['id' => $this->teamA->external_id],
                'away' => ['id' => $this->teamB->external_id],
            ],
            'goals' => [
                'home' => 1,
                'away' => 1,
            ],
        ],
        [
            'fixture' => [
                'date' => '2026-06-10T20:00:00+00:00',
                'status' => ['short' => 'FT'],
            ],
            'teams' => [
                'home' => ['id' => $this->teamB->external_id],
                'away' => ['id' => $this->teamA->external_id],
            ],
            'goals' => [
                'home' => 0,
                'away' => 2,
            ],
        ],
        [
            'fixture' => [
                'date' => '2026-06-18T20:00:00+00:00',
                'status' => ['short' => 'FT'],
            ],
            'teams' => [
                'home' => ['id' => $this->teamA->external_id],
                'away' => ['id' => $this->teamB->external_id],
            ],
            'goals' => [
                'home' => 0,
                'away' => 3,
            ],
        ],
    ], $this->teamA->id, $this->teamB->id);

    expect($summary['total_matches'])->toBe(3)
        ->and($summary['team_a_wins'])->toBe(1)
        ->and($summary['team_b_wins'])->toBe(1)
        ->and($summary['draws'])->toBe(1)
        ->and($summary['team_a_goals'])->toBe(3)
        ->and($summary['team_b_goals'])->toBe(4)
        ->and($summary['last_meeting_at']?->toDateTimeString())->toBe('2026-06-18 20:00:00');
});

test('import for teams stores zero summary when there are no finished matches', function () {
    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldReceive('getHeadToHead')
            ->once()
            ->with($this->teamA->external_id, $this->teamB->external_id)
            ->andReturn([
                [
                    'fixture' => [
                        'date' => '2026-06-20T20:00:00+00:00',
                        'status' => ['short' => 'NS'],
                    ],
                    'teams' => [
                        'home' => ['id' => $this->teamA->external_id],
                        'away' => ['id' => $this->teamB->external_id],
                    ],
                    'goals' => [
                        'home' => null,
                        'away' => null,
                    ],
                ],
            ]);
    });

    $headToHead = app(HeadToHeadService::class)->importForTeams($this->teamB->id, $this->teamA->id, true);

    expect($headToHead->pair_key)->toBe("{$this->teamA->id}-{$this->teamB->id}")
        ->and($headToHead->team_a_id)->toBe($this->teamA->id)
        ->and($headToHead->team_b_id)->toBe($this->teamB->id)
        ->and($headToHead->total_matches)->toBe(0)
        ->and($headToHead->team_a_wins)->toBe(0)
        ->and($headToHead->team_b_wins)->toBe(0)
        ->and($headToHead->draws)->toBe(0)
        ->and($headToHead->team_a_goals)->toBe(0)
        ->and($headToHead->team_b_goals)->toBe(0)
        ->and($headToHead->last_meeting_at)->toBeNull()
        ->and($headToHead->raw_data)->toHaveCount(1);
});

test('import for teams reuses fresh data unless forced', function () {
    HeadToHead::create([
        'team_a_id' => $this->teamA->id,
        'team_b_id' => $this->teamB->id,
        'pair_key' => "{$this->teamA->id}-{$this->teamB->id}",
        'total_matches' => 5,
        'team_a_wins' => 2,
        'team_b_wins' => 2,
        'draws' => 1,
        'team_a_goals' => 6,
        'team_b_goals' => 6,
        'fetched_at' => now(),
    ]);

    $this->mock(FootballApiService::class, fn (MockInterface $mock) => $mock->shouldNotReceive('getHeadToHead'));

    $headToHead = app(HeadToHeadService::class)->importForTeams($this->teamA->id, $this->teamB->id);

    expect($headToHead->total_matches)->toBe(5);
});
