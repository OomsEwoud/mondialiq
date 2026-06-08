<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\FixtureLineupService;

test('it stores lineup players when the api does not provide a formation', function () {
    $league = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 7001,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 7002,
        'name' => 'Croatia',
        'code' => 'CRO',
        'logo_url' => 'https://example.com/croatia.png',
    ]);

    $player = Player::query()->create([
        'external_id' => 9001,
        'display_name' => 'Test Starter',
    ]);

    $fixture = Fixture::query()->create([
        'external_id' => 8001,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addMinutes(45)->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $stored = app(FixtureLineupService::class)->storeLineups([
        [
            'team' => ['id' => $homeTeam->external_id],
            'formation' => null,
            'startXI' => [
                ['player' => ['id' => $player->external_id, 'number' => 10, 'pos' => 'M']],
            ],
            'substitutes' => [],
        ],
    ], $fixture->id);

    expect($stored)->toBeTrue()
        ->and($fixture->lineups()->count())->toBe(0)
        ->and($fixture->fixturePlayers()->count())->toBe(1)
        ->and($fixture->fixturePlayers()->first()?->is_starting)->toBeTrue()
        ->and($fixture->fixturePlayers()->first()?->jersey_number)->toBe(10)
        ->and($fixture->fixturePlayers()->first()?->position)->toBe('M');
});

test('it falls back to fixture team order when api lineup team ids are not mapped locally', function () {
    $league = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => 7201,
        'name' => 'Portugal',
        'code' => 'POR',
        'logo_url' => 'https://example.com/portugal.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => 7202,
        'name' => 'Chile',
        'code' => 'CHI',
        'logo_url' => 'https://example.com/chile.png',
    ]);

    $fixture = Fixture::query()->create([
        'external_id' => 8201,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => now('UTC')->addMinutes(45)->format('Y-m-d H:i:s'),
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    $stored = app(FixtureLineupService::class)->storeLineups([
        [
            'team' => ['id' => 999999, 'name' => 'Unknown API Team'],
            'formation' => '4-3-3',
            'startXI' => [
                ['player' => ['id' => 9201, 'name' => 'Fallback Starter', 'number' => 11, 'pos' => 'F']],
            ],
            'substitutes' => [],
        ],
    ], $fixture->id);

    $player = Player::query()->where('external_id', 9201)->first();

    expect($stored)->toBeTrue()
        ->and($fixture->lineups()->whereKey($homeTeam->id)->exists())->toBeTrue()
        ->and($fixture->fixturePlayers()->where('team_id', $homeTeam->id)->where('player_id', $player?->id)->exists())->toBeTrue();
});
