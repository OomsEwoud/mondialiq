<?php

use App\Models\Country;
use App\Models\League;
use App\Models\Player;
use App\Models\PlayerSeasonStat;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('the player detail page renders with season statistics', function () {
    $country = Country::query()->create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
        'flag_url' => 'https://example.com/belgium-flag.png',
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
        'league_id' => $league->id,
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
            ->where('player.firstName', 'Kevin')
            ->where('player.lastName', 'De Bruyne')
            ->where('player.birthDate', '28 Jun 1991')
            ->where('player.age', 34)
            ->where('player.photo', 'https://example.com/kdb.png')
            ->where('player.position', 'Midfielder')
            ->where('player.number', 7)
            ->where('player.country.name', 'Belgium')
            ->where('player.country.fifaCode', 'BEL')
            ->has('player.teams', 1)
            ->has('player.seasonStats', 1)
            ->where('player.seasonStats.0.season', 2026)
            ->where('player.seasonStats.0.appearances', 5)
            ->where('player.seasonStats.0.minutes', 420)
            ->where('player.seasonStats.0.rating', 7.8)
            ->where('player.seasonStats.0.goals', 2)
            ->where('player.seasonStats.0.assists', 4)
            ->where('player.seasonStats.0.passAccuracy', 87.5)
            ->where('player.seasonStats.0.yellowCards', 1)
        );
});

test('the player detail page handles players without season stats', function () {
    $player = Player::query()->create([
        'external_id' => 9002,
        'display_name' => 'Unknown Player',
    ]);

    $this->get(route('players.show', $player))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('player-details')
            ->where('player.id', $player->id)
            ->where('player.name', 'Unknown Player')
            ->where('player.seasonStats', []));
});

test('the player detail page handles players without a country', function () {
    $player = Player::query()->create([
        'external_id' => 9003,
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
        'external_id' => 9004,
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
