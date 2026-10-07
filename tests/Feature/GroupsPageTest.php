<?php

use App\Models\Country;
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
        'logo_url' => 'https://example.test/belgium.png',
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
        'logo_url' => 'https://example.test/canada.png',
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
            ->has('internationalCompetitions.data', 1)
            ->where('internationalCompetitions.data.0.name', 'World Cup')
            ->where('internationalCompetitions.data.0.season', 2026)
            ->where('domesticCompetitions.total', 0));

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

test('competition search is limited to one hundred characters', function () {
    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index', ['search' => str_repeat('x', 101)]))
        ->assertSessionHasErrors('search');
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
            ->has('internationalCompetitions.data', 1)
            ->where('internationalCompetitions.data.0.name', 'Premier League')
            ->where('internationalCompetitions.data.0.season', null));

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

test('domestic and international competitions paginate independently', function () {
    $belgium = Country::create([
        'name' => 'Belgium',
        'fifa_code' => 'BEL',
    ]);

    foreach (range(1, 6) as $number) {
        League::create([
            'external_id' => 99000 + $number,
            'name' => sprintf('Domestic %02d', $number),
            'type' => 'League',
            'country_id' => $belgium->id,
        ]);

        League::create([
            'external_id' => 99100 + $number,
            'name' => sprintf('International %02d', $number),
            'type' => 'Cup',
        ]);
    }

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index', ['domestic_page' => 2]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('domesticCompetitions.total', 6)
            ->where('domesticCompetitions.current_page', 2)
            ->has('domesticCompetitions.data', 1)
            ->where('domesticCompetitions.data.0.name', 'Domestic 06')
            ->has('internationalCompetitions.data', 5)
            ->where('internationalCompetitions.data.0.name', 'International 01')
            ->where('internationalCompetitions.current_page', 1));

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index', ['international_page' => 2]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->has('domesticCompetitions.data', 5)
            ->where('domesticCompetitions.data.0.name', 'Domestic 01')
            ->where('domesticCompetitions.current_page', 1)
            ->has('internationalCompetitions.data', 1)
            ->where('internationalCompetitions.data.0.name', 'International 06')
            ->where('internationalCompetitions.current_page', 2));

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index', [
            'domestic_page' => 2,
            'international_page' => 2,
        ]))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('domesticCompetitions.data.0.name', 'Domestic 06')
            ->where('domesticCompetitions.current_page', 2)
            ->where('internationalCompetitions.data.0.name', 'International 06')
            ->where('internationalCompetitions.current_page', 2));

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index', ['search' => 'Belgium']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('search', 'Belgium')
            ->where('domesticCompetitions.total', 6)
            ->where('internationalCompetitions.total', 0));

    $this->actingAs(User::factory()->create())
        ->get(route('competitions.index', ['search' => 'International 04']))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->where('search', 'International 04')
            ->where('domesticCompetitions.total', 0)
            ->has('internationalCompetitions.data', 1)
            ->where('internationalCompetitions.data.0.name', 'International 04'));
});
