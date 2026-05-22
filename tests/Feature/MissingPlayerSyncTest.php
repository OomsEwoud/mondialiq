<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\MissingPlayer;
use App\Models\Player;
use App\Models\Team;
use App\Services\Fixture\MissingPlayerService;

$createFixtureAndPlayer = function (): array {
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'external_id' => 4001,
        'name' => 'Brazil',
        'code' => 'BRA',
        'logo_url' => 'https://example.com/brazil.png',
    ]);

    $awayTeam = Team::create([
        'external_id' => 4002,
        'name' => 'Argentina',
        'code' => 'ARG',
        'logo_url' => 'https://example.com/argentina.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 1405443,
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

test('the missing player service stores a missing fixture player', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    $summary = app(MissingPlayerService::class)->storeMissingPlayers([
        [
            'player' => [
                'id' => $player->external_id,
                'type' => 'Missing Fixture',
                'reason' => 'Ruptured cruciate ligament',
            ],
            'fixture' => [
                'id' => $fixture->external_id,
            ],
        ],
    ]);

    expect($summary)->toBe([
        'processed' => 1,
        'created' => 1,
        'updated' => 0,
        'skipped' => 0,
    ]);

    $this->assertDatabaseHas('missing_players', [
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'type' => 'Missing Fixture',
        'reason' => 'Ruptured cruciate ligament',
    ]);
});

test('the missing player service stores a questionable player', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    app(MissingPlayerService::class)->storeMissingPlayers([
        [
            'player' => [
                'id' => $player->external_id,
                'type' => 'Questionable',
                'reason' => 'Muscle discomfort',
            ],
            'fixture' => [
                'id' => $fixture->external_id,
            ],
        ],
    ]);

    $this->assertDatabaseHas('missing_players', [
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'type' => 'Questionable',
        'reason' => 'Muscle discomfort',
    ]);
});

test('duplicate missing player records update instead of creating duplicates', function () use ($createFixtureAndPlayer) {
    [$fixture, $player] = $createFixtureAndPlayer();

    MissingPlayer::create([
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'type' => 'Missing Fixture',
        'reason' => 'Hamstring injury',
    ]);

    $summary = app(MissingPlayerService::class)->storeMissingPlayers([
        [
            'player' => [
                'id' => $player->external_id,
                'type' => 'Questionable',
                'reason' => 'Fitness doubt',
            ],
            'fixture' => [
                'id' => $fixture->external_id,
            ],
        ],
    ]);

    expect($summary)->toBe([
        'processed' => 1,
        'created' => 0,
        'updated' => 1,
        'skipped' => 0,
    ]);

    expect(MissingPlayer::query()->count())->toBe(1);

    $this->assertDatabaseHas('missing_players', [
        'fixture_id' => $fixture->id,
        'player_id' => $player->id,
        'type' => 'Questionable',
        'reason' => 'Fitness doubt',
    ]);
});

test('records with a missing fixture or player are skipped safely', function () use ($createFixtureAndPlayer) {
    [$fixture] = $createFixtureAndPlayer();

    $summary = app(MissingPlayerService::class)->storeMissingPlayers([
        [
            'player' => [
                'id' => 999999,
                'type' => 'Missing Fixture',
                'reason' => 'Unavailable',
            ],
            'fixture' => [
                'id' => $fixture->external_id,
            ],
        ],
        [
            'player' => [
                'id' => 78172,
                'type' => 'Questionable',
                'reason' => 'Illness',
            ],
            'fixture' => [
                'id' => 999888,
            ],
        ],
    ]);

    expect($summary)->toBe([
        'processed' => 2,
        'created' => 0,
        'updated' => 0,
        'skipped' => 2,
    ]);

    expect(MissingPlayer::query()->count())->toBe(0);
});
