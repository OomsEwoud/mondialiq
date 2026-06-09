<?php

use App\Models\Country;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Player;
use App\Models\Team;
use App\Services\Player\PlayerService;

test('a player without nationality gets country_id from the team during squad sync', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

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
        'country_id' => $country->id,
    ]);

    $opponent = Team::query()->create([
        'external_id' => 101,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    Fixture::query()->create([
        'external_id' => 1,
        'league_id' => $league->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $service = app(PlayerService::class);
    $service->resetStats();

    $service->storeTeamPlayers($team, [
        [
            'players' => [
                [
                    'id' => 9001,
                    'name' => 'Kevin De Bruyne',
                    'firstname' => 'Kevin',
                    'lastname' => 'De Bruyne',
                    'position' => 'Midfielder',
                    'number' => 7,
                    'photo' => 'https://example.com/kdb.png',
                ],
            ],
        ],
    ]);

    $player = Player::query()->where('external_id', 9001)->firstOrFail();

    expect($player->country_id)->toBe($country->id)
        ->and($player->display_name)->toBe('Kevin De Bruyne')
        ->and($player->first_name)->toBe('Kevin')
        ->and($player->last_name)->toBe('De Bruyne')
        ->and($player->position)->toBe('Midfielder')
        ->and($player->number)->toBe(7)
        ->and($player->photo_url)->toBe('https://example.com/kdb.png')
        ->and($player->teams()->where('team_id', $team->id)->exists())->toBeTrue();

    $stats = $service->stats();

    expect($stats['processed'])->toBe(1)
        ->and($stats['country_filled'])->toBe(1)
        ->and($stats['missing_country'])->toBe(0);
});

test('an existing player with country_id gets overridden to team country during squad sync', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

    $otherCountry = Country::query()->create([
        'name' => 'France',
        'fifa_code' => 'FRA',
    ]);

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
        'country_id' => $country->id,
    ]);

    $opponent = Team::query()->create([
        'external_id' => 101,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    Fixture::query()->create([
        'external_id' => 1,
        'league_id' => $league->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $existingPlayer = Player::query()->create([
        'external_id' => 9002,
        'display_name' => 'Romelu Lukaku',
        'country_id' => $otherCountry->id,
    ]);

    $service = app(PlayerService::class);
    $service->resetStats();

    $service->storeTeamPlayers($team, [
        [
            'players' => [
                [
                    'id' => 9002,
                    'name' => 'Romelu Lukaku',
                    'firstname' => 'Romelu',
                    'lastname' => 'Lukaku',
                    'position' => 'Attacker',
                ],
            ],
        ],
    ]);

    $existingPlayer->refresh();

    expect($existingPlayer->country_id)->toBe($country->id)
        ->and($existingPlayer->first_name)->toBe('Romelu')
        ->and($existingPlayer->last_name)->toBe('Lukaku')
        ->and($existingPlayer->position)->toBe('Attacker');

    $stats = $service->stats();

    expect($stats['processed'])->toBe(1)
        ->and($stats['country_filled'])->toBe(1)
        ->and($stats['missing_country'])->toBe(0);
});

test('an existing player without country_id gets filled from team during squad sync', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

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
        'country_id' => $country->id,
    ]);

    $opponent = Team::query()->create([
        'external_id' => 101,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    Fixture::query()->create([
        'external_id' => 1,
        'league_id' => $league->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $existingPlayer = Player::query()->create([
        'external_id' => 9003,
        'display_name' => 'Thibaut Courtois',
        'country_id' => null,
    ]);

    $service = app(PlayerService::class);
    $service->resetStats();

    $service->storeTeamPlayers($team, [
        [
            'players' => [
                [
                    'id' => 9003,
                    'name' => 'Thibaut Courtois',
                    'firstname' => 'Thibaut',
                    'lastname' => 'Courtois',
                    'position' => 'Goalkeeper',
                ],
            ],
        ],
    ]);

    $existingPlayer->refresh();

    expect($existingPlayer->country_id)->toBe($country->id)
        ->and($existingPlayer->position)->toBe('Goalkeeper');

    $stats = $service->stats();

    expect($stats['processed'])->toBe(1)
        ->and($stats['country_filled'])->toBe(1)
        ->and($stats['missing_country'])->toBe(0);
});

test('player import does not crash when team has no country_id', function () {
    $league = League::query()->create([
        'external_id' => 1,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $team = Team::query()->create([
        'external_id' => 100,
        'name' => 'Orphan Nation',
        'code' => 'ORN',
        'logo_url' => 'https://example.com/orphan.png',
        'country_id' => null,
    ]);

    $opponent = Team::query()->create([
        'external_id' => 101,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    Fixture::query()->create([
        'external_id' => 1,
        'league_id' => $league->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $service = app(PlayerService::class);
    $service->resetStats();

    $service->storeTeamPlayers($team, [
        [
            'players' => [
                [
                    'id' => 9004,
                    'name' => 'No Country Player',
                    'position' => 'Defender',
                ],
            ],
        ],
    ]);

    $player = Player::query()->where('external_id', 9004)->firstOrFail();

    expect($player->country_id)->toBeNull()
        ->and($player->display_name)->toBe('No Country Player');

    $stats = $service->stats();

    expect($stats['processed'])->toBe(1)
        ->and($stats['country_filled'])->toBe(0)
        ->and($stats['missing_country'])->toBe(1);
});

test('a player with nationality from api gets country_id overridden to team country during squad sync', function () {
    $country = Country::query()->create([
        'name' => 'France',
        'fifa_code' => 'FRA',
    ]);

    $teamCountry = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

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
        'country_id' => $teamCountry->id,
    ]);

    $opponent = Team::query()->create([
        'external_id' => 101,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    Fixture::query()->create([
        'external_id' => 1,
        'league_id' => $league->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $service = app(PlayerService::class);
    $service->resetStats();

    $service->storeTeamPlayers($team, [
        [
            'players' => [
                [
                    'id' => 9005,
                    'name' => 'Frenchie',
                    'nationality' => 'France',
                    'position' => 'Midfielder',
                ],
            ],
        ],
    ]);

    $player = Player::query()->where('external_id', 9005)->firstOrFail();

    expect($player->country_id)->toBe($teamCountry->id)
        ->and($player->display_name)->toBe('Frenchie');

    $stats = $service->stats();

    expect($stats['processed'])->toBe(1)
        ->and($stats['country_filled'])->toBe(1)
        ->and($stats['missing_country'])->toBe(0);
});

test('sync team players marks previous squad members inactive before syncing new squad', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

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
        'country_id' => $country->id,
    ]);

    $opponent = Team::query()->create([
        'external_id' => 101,
        'name' => 'France',
        'code' => 'FRA',
        'logo_url' => 'https://example.com/france.png',
    ]);

    Fixture::query()->create([
        'external_id' => 1,
        'league_id' => $league->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - 1',
        'season' => 2026,
        'match_date' => now()->addDay(),
        'status_long' => 'Not Started',
    ]);

    $oldPlayer = Player::query()->create([
        'external_id' => 9006,
        'display_name' => 'Old Player',
    ]);

    $team->players()->attach($oldPlayer->id, ['is_active' => true]);

    $service = app(PlayerService::class);
    $service->resetStats();

    $service->storeTeamPlayers($team, [
        [
            'players' => [
                [
                    'id' => 9007,
                    'name' => 'New Player',
                    'position' => 'Attacker',
                ],
            ],
        ],
    ]);

    $oldPlayer->refresh();
    $newPlayer = Player::query()->where('external_id', 9007)->firstOrFail();

    expect($oldPlayer->teams()->wherePivot('team_id', $team->id)->value('is_active'))->toBe(0)
        ->and($newPlayer->teams()->wherePivot('team_id', $team->id)->value('is_active'))->toBe(1);
});
