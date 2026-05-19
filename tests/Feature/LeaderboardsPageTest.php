<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createLeaderboardFixture(): Fixture
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

test('guest users are redirected from the leaderboards page', function () {
    $this->get(route('leaderboards'))->assertRedirect(route('login'));
});

test('the leaderboards page shows the top 10 and current user standing', function () {
    $fixture = createLeaderboardFixture();

    $users = User::factory()->count(12)->create();
    $currentUser = $users->last();

    $users->each(function (User $user, int $index) use ($fixture) {
        Prediction::create([
            'fixture_id' => $fixture->id,
            'user_id' => $user->id,
            'source' => PredictionTypes::User->value,
            'points' => 120 - ($index * 10),
        ]);
    });

    $response = $this
        ->actingAs($currentUser)
        ->get(route('leaderboards'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('globalLeaders', 10)
            ->where('globalLeaders.0.rank', 1)
            ->where('globalLeaders.0.id', $users->first()->id)
            ->where('globalLeaders.0.totalPoints', 120)
            ->where('globalLeaders.9.rank', 10)
            ->where('globalLeaders.9.id', $users->get(9)->id)
            ->where('currentUserStanding.id', $currentUser->id)
            ->where('currentUserStanding.rank', 12)
            ->where('currentUserStanding.totalPoints', 10)
            ->where('totalPlayers', 12),
        );
});

test('the leaderboards page shows joined friends leagues for the current user', function () {
    $fixture = createLeaderboardFixture();

    $currentUser = User::factory()->create(['name' => 'Current Player']);
    $leagueLeader = User::factory()->create(['name' => 'League Leader']);
    $thirdMember = User::factory()->create(['name' => 'Third Member']);

    $friendsLeague = Scoreboard::create([
        'name' => 'Friends League',
        'icon' => '⚡',
        'accent_color' => 'blue',
        'cover_style' => 'night',
        'code' => 'FRIENDS1',
    ]);

    $friendsLeague->users()->attach([
        $currentUser->id,
        $leagueLeader->id,
        $thirdMember->id,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $leagueLeader->id,
        'source' => PredictionTypes::User->value,
        'points' => 25,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $currentUser->id,
        'source' => PredictionTypes::User->value,
        'points' => 18,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $thirdMember->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
    ]);

    $response = $this
        ->actingAs($currentUser)
        ->get(route('leaderboards'));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('joinedLeagues', 1)
            ->where('joinedLeagues.0.name', 'Friends League')
            ->where('joinedLeagues.0.icon', '⚡')
            ->where('joinedLeagues.0.accent_color', 'blue')
            ->where('joinedLeagues.0.cover_style', 'night')
            ->where('joinedLeagues.0.can_manage', false)
            ->where('joinedLeagues.0.can_leave', true)
            ->where('joinedLeagues.0.members_count', 3)
            ->where('joinedLeagues.0.user_rank', 2)
            ->where('joinedLeagues.0.leader_name', 'League Leader')
            ->where('joinedLeagues.0.points', 18)
            ->where('joinedLeagues.0.predictions_count', 1)
            ->where('joinedLeagues.0.href', route('leagues.show', $friendsLeague))
            ->where('joinedLeagues.0.settings_href', null)
            ->where('joinedLeagues.0.leave_href', route('leagues.leave', $friendsLeague))
            ->where('currentLeagueCount', 1)
            ->where('maxLeagueCount', 5)
            ->where('createLeagueHref', route('leagues.create'))
            ->where('joinLeagueHref', route('leagues.join')),
        );
});

test('the leaderboards page gives owners a settings action instead of leave', function () {
    $currentUser = User::factory()->create(['name' => 'Owner Player']);

    $ownedLeague = Scoreboard::create([
        'name' => 'Owned League',
        'icon' => '🏆',
        'accent_color' => 'cyan',
        'cover_style' => 'stadium',
        'code' => 'OWNED001',
        'owner_id' => $currentUser->id,
    ]);

    $ownedLeague->users()->attach($currentUser->id);

    $this->actingAs($currentUser)
        ->get(route('leaderboards'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('joinedLeagues', 1)
            ->where('joinedLeagues.0.name', 'Owned League')
            ->where('joinedLeagues.0.can_manage', true)
            ->where('joinedLeagues.0.can_leave', false)
            ->where('joinedLeagues.0.settings_href', route('leagues.settings', $ownedLeague))
            ->where('joinedLeagues.0.leave_href', null),
        );
});
