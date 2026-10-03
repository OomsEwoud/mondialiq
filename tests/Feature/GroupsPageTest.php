<?php

use App\Models\League;
use App\Models\Standing;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('competition pages expose available leagues and standings', function () {
    $league = League::create([
        'external_id' => 99901,
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);
    $team = Team::create([
        'external_id' => 99901,
        'name' => 'Belgium',
        'code' => 'BEL',
    ]);

    Standing::create([
        'team_id' => $team->id,
        'league_id' => $league->id,
        'season' => 2026,
        'group_name' => 'Group A',
        'rank' => 1,
        'points' => 3,
        'matches_played' => 1,
        'wins' => 1,
        'draws' => 0,
        'losses' => 0,
        'goals_for' => 2,
        'goals_against' => 0,
        'goal_difference' => 2,
    ]);
    $thirdPlacedTeam = Team::create([
        'external_id' => 99903,
        'name' => 'Canada',
        'code' => 'CAN',
    ]);
    Standing::create([
        'team_id' => $thirdPlacedTeam->id,
        'league_id' => $league->id,
        'season' => 2026,
        'group_name' => 'Ranking of third-placed teams',
        'rank' => 1,
        'points' => 2,
        'matches_played' => 3,
        'wins' => 0,
        'draws' => 2,
        'losses' => 1,
        'goals_for' => 2,
        'goals_against' => 3,
        'goal_difference' => -1,
    ]);

    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('competitions.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('competitions/index')
            ->has('competitions', 1)
            ->where('competitions.0.name', 'World Cup')
            ->where('competitions.0.season', 2026));

    $this->actingAs($user)
        ->get(route('competitions.show', ['league' => $league, 'tab' => 'standings']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('competitions/show')
            ->where('tab', 'standings')
            ->where('competition.name', 'World Cup')
            ->has('standings', 2)
            ->where('standings.0.name', 'Group A')
            ->where('standings.0.teams.0.name', 'Belgium')
            ->where('standings.0.teams.0.points', 3)
            ->where('standings.1.name', 'Ranking of third-placed teams')
            ->where('standings.1.teams.0.name', 'Canada'));
});

test('legacy groups route redirects to the competition directory', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('groups'))
        ->assertRedirect(route('competitions.index'));
});

test('competition pages require authentication and ignore unknown tabs', function () {
    $league = League::create([
        'external_id' => 99902,
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $this->get(route('competitions.index'))
        ->assertRedirect(route('login'));

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('competitions/index')
            ->has('competitions', 1)
            ->where('competitions.0.name', 'Premier League')
            ->where('competitions.0.season', null));

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.show', ['league' => $league, 'tab' => 'unavailable']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('competitions/show')
            ->where('tab', 'overview')
            ->has('standings', 0)
            ->has('teams', 0)
            ->has('fixtures.all.data', 0));
});
