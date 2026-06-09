<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use Inertia\Testing\AssertableInertia as Assert;

test('a world cup team detail page renders successfully', function () {
    $worldCupLeague = League::query()->create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $team = Team::query()->create([
        'external_id' => 1001,
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $opponent = Team::query()->create([
        'external_id' => 1002,
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    Fixture::query()->create([
        'external_id' => 101,
        'league_id' => $worldCupLeague->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    $this->get(route('teams.show', $team))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('team-details')
            ->where('team.name', 'Belgium'));
});

test('a non world cup team detail page returns 404', function () {
    $otherLeague = League::query()->create([
        'external_id' => 9999,
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $team = Team::query()->create([
        'external_id' => 5001,
        'name' => 'Liverpool',
        'code' => 'LIV',
        'logo_url' => 'https://example.com/liverpool.png',
    ]);

    $opponent = Team::query()->create([
        'external_id' => 5002,
        'name' => 'Chelsea',
        'code' => 'CHE',
        'logo_url' => 'https://example.com/chelsea.png',
    ]);

    Fixture::query()->create([
        'external_id' => 501,
        'league_id' => $otherLeague->id,
        'home_team_id' => $team->id,
        'away_team_id' => $opponent->id,
        'round_name' => 'Round 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    $this->get(route('teams.show', $team))
        ->assertNotFound();
});

test('a team without any fixtures returns 404', function () {
    $team = Team::query()->create([
        'external_id' => 6001,
        'name' => 'Orphan Team',
        'code' => 'ORP',
        'logo_url' => 'https://example.com/orphan.png',
    ]);

    $this->get(route('teams.show', $team))
        ->assertNotFound();
});
