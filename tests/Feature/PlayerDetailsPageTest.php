<?php

use App\Models\Country;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'services.api_football.league_id' => 1,
        'services.api_football.season' => 2026,
    ]);
});

test('the player detail page renders with world cup 2026 season statistics', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
        'flag_url' => 'https://example.com/belgium-flag.png',
    ]);

    $worldCupLeague = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
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

    $player = Player::query()->create([
        'external_id' => 9001,
        'first_name' => 'Kevin',
        'last_name' => 'De Bruyne',
        'display_name' => 'Kevin De Bruyne',
        'birth_date' => '1991-06-28',
        'photo_url' => 'https://example.com/kdb.png',
        'position' => 'Midfielder',
        'number' => 7,
        'country_id' => $country->id,
    ]);

    $team->players()->attach($player->id, ['is_active' => true]);

    PlayerSeasonStat::query()->create([
        'player_id' => $player->id,
        'league_id' => $worldCupLeague->id,
        'season' => 2026,
        'appearances' => 5,
        'total_minutes' => 420,
        'position' => 'Midfielder',
        'rating' => 7.8,
        'total_goals' => 2,
        'total_assists' => 4,
        'total_shots' => 12,
        'shots_on_target' => 6,
        'total_passes' => 320,
        'key_passes' => 15,
        'pass_accuracy' => 87.5,
        'total_tackles' => 8,
        'yellow_cards' => 1,
        'red_cards' => 0,
    ]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->where('player.id', $player->id)
            ->where('player.name', 'Kevin De Bruyne')
            ->has('player.seasonStats', 1)
            ->where('player.seasonStats.0.season', 2026)
            ->where('player.seasonStats.0.appearances', 5)
        );
});

test('the player detail page excludes friendlies season statistics', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

    $worldCupLeague = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $friendliesLeague = League::query()->create([
        'external_id' => 9999,
        'name' => 'Friendlies',
        'type' => 'Cup',
    ]);

    $team = Team::query()->create([
        'external_id' => 100,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
        'country_id' => $country->id,
    ]);

    $player = Player::query()->create([
        'external_id' => 9002,
        'display_name' => 'Test Player',
        'country_id' => $country->id,
    ]);

    $team->players()->attach($player->id, ['is_active' => true]);

    PlayerSeasonStat::query()->create([
        'player_id' => $player->id,
        'league_id' => $friendliesLeague->id,
        'season' => 2026,
        'appearances' => 3,
        'total_goals' => 5,
    ]);

    PlayerSeasonStat::query()->create([
        'player_id' => $player->id,
        'league_id' => $worldCupLeague->id,
        'season' => 2026,
        'appearances' => 2,
        'total_goals' => 1,
    ]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->has('player.seasonStats', 1)
            ->where('player.seasonStats.0.appearances', 2)
            ->where('player.seasonStats.0.goals', 1));
});

test('the player detail page shows empty state when only friendlies stats exist', function () {
    $friendliesLeague = League::query()->create([
        'external_id' => 9999,
        'name' => 'Friendlies',
        'type' => 'Cup',
    ]);

    $player = Player::query()->create([
        'external_id' => 9003,
        'display_name' => 'Friendlies Only Player',
    ]);

    PlayerSeasonStat::query()->create([
        'player_id' => $player->id,
        'league_id' => $friendliesLeague->id,
        'season' => 2026,
        'appearances' => 10,
        'total_goals' => 8,
    ]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->where('player.seasonStats', []));
});

test('the player detail page shows empty state when no world cup stats exist and wrong season', function () {
    $worldCupLeague = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $player = Player::query()->create([
        'external_id' => 9004,
        'display_name' => 'Old Season Player',
    ]);

    PlayerSeasonStat::query()->create([
        'player_id' => $player->id,
        'league_id' => $worldCupLeague->id,
        'season' => 2022,
        'appearances' => 7,
        'total_goals' => 3,
    ]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->where('player.seasonStats', []));
});

test('the player detail page handles players without a country', function () {
    $player = Player::query()->create([
        'external_id' => 9005,
        'display_name' => 'No Country Player',
        'country_id' => null,
    ]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->where('player.country', null));
});

test('the player detail page shows active teams only', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

    $activeTeam = Team::query()->create([
        'external_id' => 100,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
        'country_id' => $country->id,
    ]);

    $inactiveTeam = Team::query()->create([
        'external_id' => 101,
        'name' => 'Old Club',
        'code' => 'OLD',
        'logo_url' => 'https://example.com/old.png',
    ]);

    $player = Player::query()->create([
        'external_id' => 9006,
        'display_name' => 'Team Hopper',
    ]);

    $activeTeam->players()->attach($player->id, ['is_active' => true]);
    $inactiveTeam->players()->attach($player->id, ['is_active' => false]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->has('player.teams', 1)
            ->where('player.teams.0.name', 'Belgium'));
});
