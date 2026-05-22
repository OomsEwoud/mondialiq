<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerFixtureStat;
use App\Models\Team;
use App\Services\Fixture\FixturePlayerStatsService;

$createFixtureAndPlayer = function (): array {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 5001,
        'name' => 'England',
        'code' => 'ENG',
        'logo_url' => 'https://example.com/england.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 5002,
        'name' => 'Italy',
        'code' => 'ITA',
        'logo_url' => 'https://example.com/italy.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 1600001,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $player = Player::create([
        'external_id' => 78172,
        'display_name' => 'Joao Paulo da Silva Araujo',
        'photo_url' => 'https://example.com/player.png',
    ]);

    return [$fixture, $player];
};

test('the fixture player stats service stores player stats for a matched player and fixture', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    $summary = app(FixturePlayerStatsService::class)->storeFixturePlayerStats([
        [
            'team' => ['id' => 5001],
            'players' => [
                [
                    'player' => [
                        'id' => $player->external_id,
                        'name' => $player->display_name,
                    ],
                    'statistics' => [
                        [
                            'games' => [
                                'minutes' => 90,
                                'number' => 10,
                                'position' => 'M',
                                'rating' => '8.7',
                                'captain' => true,
                                'substitute' => false,
                            ],
                            'offsides' => 1,
                            'shots' => ['total' => 3, 'on' => 2],
                            'goals' => ['total' => 1, 'conceded' => 0, 'assists' => 1, 'saves' => 0],
                            'passes' => ['total' => 55, 'key' => 4, 'accuracy' => '87'],
                            'tackles' => ['total' => 2, 'blocks' => 1, 'interceptions' => 3],
                            'duels' => ['total' => 8, 'won' => 5],
                            'dribbles' => ['attempts' => 4, 'success' => 2, 'past' => 1],
                            'fouls' => ['drawn' => 3, 'committed' => 1],
                            'cards' => ['yellow' => 1, 'red' => 0],
                            'penalty' => ['won' => 1, 'commited' => 0, 'scored' => 1, 'missed' => 0, 'saved' => 0],
                        ],
                    ],
                ],
            ],
        ],
    ], $fixture->id);

    expect($summary)->toBe([
        'processed' => 1,
        'created' => 1,
        'updated' => 0,
        'skipped' => 0,
    ]);

    $this->assertDatabaseHas('player_fixture_stats', [
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'game_minutes' => 90,
        'number' => 10,
        'position' => 'M',
        'rating' => 8.70,
        'is_captain' => true,
        'is_substitute' => false,
        'offsides' => 1,
        'total_shots' => 3,
        'shots_on_target' => 2,
        'goals' => 1,
        'goals_conceded' => 0,
        'assists' => 1,
        'saves' => 0,
        'passes' => 55,
        'key_passes' => 4,
        'passes_accuracy' => 87,
        'tackles' => 2,
        'blocks' => 1,
        'interceptions' => 3,
        'duels' => 8,
        'duels_won' => 5,
        'dribbles_attempts' => 4,
        'dribbles_success' => 2,
        'dribbles_past' => 1,
        'fouls_drawn' => 3,
        'fouls_committed' => 1,
        'yellow_cards' => 1,
        'red_cards' => 0,
        'penalties_won' => 1,
        'penalties_committed' => 0,
        'penalties_scored' => 1,
        'penalties_missed' => 0,
        'penalties_saved' => 0,
    ]);
});

test('null player stats are stored safely as zero or null defaults', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    app(FixturePlayerStatsService::class)->storeFixturePlayerStats([
        [
            'team' => ['id' => 5001],
            'players' => [
                [
                    'player' => [
                        'id' => $player->external_id,
                    ],
                    'statistics' => [
                        [
                            'games' => [
                                'minutes' => null,
                                'number' => null,
                                'position' => null,
                                'rating' => null,
                                'captain' => null,
                                'substitute' => null,
                            ],
                            'offsides' => null,
                            'shots' => ['total' => null, 'on' => null],
                            'goals' => ['total' => null, 'conceded' => null, 'assists' => null, 'saves' => null],
                            'passes' => ['total' => null, 'key' => null, 'accuracy' => null],
                            'tackles' => ['total' => null, 'blocks' => null, 'interceptions' => null],
                            'duels' => ['total' => null, 'won' => null],
                            'dribbles' => ['attempts' => null, 'success' => null, 'past' => null],
                            'fouls' => ['drawn' => null, 'committed' => null],
                            'cards' => ['yellow' => null, 'red' => null],
                            'penalty' => ['won' => null, 'commited' => null, 'scored' => null, 'missed' => null, 'saved' => null],
                        ],
                    ],
                ],
            ],
        ],
    ], $fixture->id);

    $stat = PlayerFixtureStat::query()->sole();

    expect($stat->game_minutes)->toBe(0)
        ->and($stat->number)->toBeNull()
        ->and($stat->position)->toBeNull()
        ->and($stat->rating)->toBeNull()
        ->and($stat->passes_accuracy)->toBe(0.0)
        ->and($stat->penalties_committed)->toBe(0);
});

test('rating strings are stored correctly', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    app(FixturePlayerStatsService::class)->storeFixturePlayerStats([
        [
            'team' => ['id' => 5001],
            'players' => [
                [
                    'player' => [
                        'id' => $player->external_id,
                    ],
                    'statistics' => [
                        [
                            'games' => [
                                'minutes' => 90,
                                'number' => 7,
                                'position' => 'F',
                                'rating' => '10',
                                'captain' => false,
                                'substitute' => false,
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ], $fixture->id);

    $stat = PlayerFixtureStat::query()->sole();

    expect($stat->rating)->toBe(10.0);
});

test('duplicate player stat records update instead of creating duplicates', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    PlayerFixtureStat::create([
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'game_minutes' => 45,
        'number' => 8,
        'position' => 'M',
        'rating' => 6.5,
        'is_captain' => false,
        'is_substitute' => true,
    ]);

    $summary = app(FixturePlayerStatsService::class)->storeFixturePlayerStats([
        [
            'team' => ['id' => 5001],
            'players' => [
                [
                    'player' => [
                        'id' => $player->external_id,
                    ],
                    'statistics' => [
                        [
                            'games' => [
                                'minutes' => 90,
                                'number' => 8,
                                'position' => 'M',
                                'rating' => '7.4',
                                'captain' => false,
                                'substitute' => false,
                            ],
                            'shots' => ['total' => 2, 'on' => 1],
                        ],
                    ],
                ],
            ],
        ],
    ], $fixture->id);

    expect($summary)->toBe([
        'processed' => 1,
        'created' => 0,
        'updated' => 1,
        'skipped' => 0,
    ]);

    expect(PlayerFixtureStat::query()->count())->toBe(1);

    $this->assertDatabaseHas('player_fixture_stats', [
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'game_minutes' => 90,
        'rating' => 7.40,
        'is_substitute' => false,
        'total_shots' => 2,
        'shots_on_target' => 1,
    ]);
});

test('unknown players are skipped safely', function () use ($createFixtureAndPlayer) {
    [$fixture] = $createFixtureAndPlayer();

    $summary = app(FixturePlayerStatsService::class)->storeFixturePlayerStats([
        [
            'team' => ['id' => 5001],
            'players' => [
                [
                    'player' => [
                        'id' => 999999,
                    ],
                    'statistics' => [
                        [
                            'games' => [
                                'minutes' => 90,
                                'number' => 9,
                                'position' => 'F',
                                'rating' => '7.1',
                            ],
                        ],
                    ],
                ],
            ],
        ],
    ], $fixture->id);

    expect($summary)->toBe([
        'processed' => 1,
        'created' => 0,
        'updated' => 0,
        'skipped' => 1,
    ]);

    expect(PlayerFixtureStat::query()->count())->toBe(0);
});
