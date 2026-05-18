<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createFriendsLeagueFixture(): Fixture
{
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::create([
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    return Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Finished',
    ]);
}

test('an authenticated user can view the create league page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('leagues.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-create'),
        );
});

test('an authenticated user can view the join league page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('leagues.join'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-join'),
        );
});

test('the join league page pre-fills the invite code from the query string', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('leagues.join', ['code' => 'join2026abc']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-join')
            ->where('initialCode', 'JOIN2026'),
        );
});

test('an authenticated user can create a friends league and joins it immediately', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('leagues.store'), [
            'name' => 'MondialIQ Crew',
        ]);

    $league = Scoreboard::query()->first();

    $response
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'League created.',
        ]);

    $this->assertDatabaseHas('scoreboards', [
        'name' => 'MondialIQ Crew',
    ]);

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('a league name is required to create a friends league', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('leagues.store'), [
            'name' => '',
        ])
        ->assertSessionHasErrors('name');

    expect(Scoreboard::query()->count())->toBe(0);
});

test('an authenticated user can join a friends league with a valid code', function () {
    $user = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Joinable League',
        'code' => 'JOIN2026',
    ]);

    $response = $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'join2026',
        ]);

    $response
        ->assertRedirect(route('leagues.show', $league))
        ->assertSessionHas('inertia.flash_data.toast', [
            'type' => 'success',
            'message' => 'You joined Joinable League.',
        ]);

    $this->assertDatabaseHas('users_has_scoreboards', [
        'user_id' => $user->id,
        'scoreboard_id' => $league->id,
    ]);
});

test('an invite code must exist to join a friends league', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'INVALID1',
        ])
        ->assertSessionHasErrors('code');
});

test('a user cannot join the same friends league twice', function () {
    $user = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Already Joined League',
        'code' => 'ALREADY1',
    ]);

    $league->users()->attach($user->id);

    $this->actingAs($user)
        ->post(route('leagues.join.store'), [
            'code' => 'ALREADY1',
        ])
        ->assertSessionHasErrors('code');
});

test('a league member can view the league detail page with rankings', function () {
    $fixture = createFriendsLeagueFixture();

    $currentUser = User::factory()->create(['name' => 'Current Player']);
    $leader = User::factory()->create(['name' => 'League Captain']);
    $thirdMember = User::factory()->create(['name' => 'Third Member']);

    $league = Scoreboard::create([
        'name' => 'Friends League',
        'code' => 'FRIENDS1',
    ]);

    $league->users()->attach([
        $currentUser->id,
        $leader->id,
        $thirdMember->id,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $leader->id,
        'source' => PredictionTypes::User->value,
        'points' => 30,
        'updated_at' => now()->subHours(3),
        'created_at' => now()->subHours(3),
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $currentUser->id,
        'source' => PredictionTypes::User->value,
        'points' => 20,
        'updated_at' => now()->subHour(),
        'created_at' => now()->subHour(),
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $thirdMember->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
        'updated_at' => now()->subHours(5),
        'created_at' => now()->subHours(5),
    ]);

    $this->actingAs($currentUser)
        ->get(route('leagues.show', $league))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-show')
            ->where('league.name', 'Friends League')
            ->where('league.code', 'FRIENDS1')
            ->where('league.joinHref', route('leagues.join', ['code' => 'FRIENDS1']))
            ->where('league.membersCount', 3)
            ->where('league.currentLeader', 'League Captain')
            ->where('league.leaderPoints', 30)
            ->where('league.currentUserPoints', 20)
            ->where('league.totalPredictions', 3)
            ->where('league.lastActivityLabel', now()->subHour()->diffForHumans())
            ->where('league.gapToLeader.points', 10)
            ->where('league.gapToLeader.summary', 'You are 10 pts behind League Captain.')
            ->where('league.currentUserRank', 2)
            ->has('league.members', 3)
            ->where('league.members.0.name', 'League Captain')
            ->where('league.members.1.name', 'Current Player')
            ->where('league.members.1.isCurrentUser', true),
        );
});

test('a non member cannot view a private league detail page', function () {
    $user = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Private League',
        'code' => 'PRIVATE1',
    ]);

    $this->actingAs($user)
        ->get(route('leagues.show', $league))
        ->assertForbidden();
});
