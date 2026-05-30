<?php

use App\Models\League;
use App\Models\Standing;
use App\Models\Team;
use App\Services\Standing\StandingService;

test('standing service stores standings for known teams', function () {
    $league = League::query()->create([
        'external_id' => 1,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $team = Team::query()->create([
        'external_id' => 100,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    app(StandingService::class)->storeStandings([
        [
            'league' => [
                'name' => 'World Cup',
                'season' => 2026,
                'standings' => [
                    [
                        standingPayload(100, [
                            'rank' => 2,
                            'points' => 7,
                            'played' => 3,
                            'win' => 2,
                            'draw' => 1,
                            'lose' => 0,
                            'goals_for' => 5,
                            'goals_against' => 2,
                            'goalsDiff' => 3,
                            'form' => 'WDW',
                        ]),
                    ],
                ],
            ],
        ],
    ]);

    $standing = Standing::query()->firstOrFail();

    expect($standing->team_id)->toBe($team->id)
        ->and($standing->league_id)->toBe($league->id)
        ->and($standing->season)->toBe(2026)
        ->and($standing->rank)->toBe(2)
        ->and($standing->points)->toBe(7)
        ->and($standing->matches_played)->toBe(3)
        ->and($standing->wins)->toBe(2)
        ->and($standing->draws)->toBe(1)
        ->and($standing->losses)->toBe(0)
        ->and($standing->goals_for)->toBe(5)
        ->and($standing->goals_against)->toBe(2)
        ->and($standing->goal_difference)->toBe(3)
        ->and($standing->form)->toBe('WDW');
});

test('standing service skips unknown teams and empty payloads', function () {
    League::query()->create([
        'external_id' => 1,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    app(StandingService::class)->storeStandings([
        [
            'league' => [
                'name' => 'World Cup',
                'season' => 2026,
                'standings' => [[standingPayload(999)]],
            ],
        ],
    ]);
    app(StandingService::class)->storeStandings([]);

    expect(Standing::query()->count())->toBe(0);
});

function standingPayload(int $teamExternalId, array $overrides = []): array
{
    return [
        'group' => $overrides['group'] ?? 'Group A',
        'rank' => $overrides['rank'] ?? 1,
        'points' => $overrides['points'] ?? 0,
        'all' => [
            'played' => $overrides['played'] ?? 0,
            'win' => $overrides['win'] ?? 0,
            'draw' => $overrides['draw'] ?? 0,
            'lose' => $overrides['lose'] ?? 0,
            'goals' => [
                'for' => $overrides['goals_for'] ?? 0,
                'against' => $overrides['goals_against'] ?? 0,
            ],
        ],
        'goalsDiff' => $overrides['goalsDiff'] ?? 0,
        'form' => $overrides['form'] ?? null,
        'team' => ['id' => $teamExternalId],
    ];
}
