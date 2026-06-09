<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;

function createUserPredictionFixture(): Fixture
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
        'status_long' => 'Not Started',
    ]);
}

test('a viewer can see public predictions of another user', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'home_goals' => 2,
        'away_goals' => 1,
    ]);

    $this
        ->actingAs($viewer)
        ->get(route('users.predictions', $owner))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user-predictions')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.userPrediction.homeScore', 2)
            ->where('fixtures.data.0.userPrediction.awayScore', 1)
            ->where('user.id', $owner->id)
            ->where('user.isViewer', false),
        );
});

test('a user can see their own private predictions', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $owner = User::factory()->create();
    $owner->userPreference()->update([
        'predictions_visibility' => 'private',
        'show_on_leaderboards' => false,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'home_goals' => 2,
        'away_goals' => 1,
    ]);

    $this
        ->actingAs($owner)
        ->get(route('users.predictions', $owner))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('user-predictions')
            ->has('fixtures.data', 1)
            ->where('user.isViewer', true),
        );
});

test('a viewer cannot see private predictions of another user', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $owner = User::factory()->create();
    $viewer = User::factory()->create();
    $owner->userPreference()->update([
        'predictions_visibility' => 'private',
        'show_on_leaderboards' => false,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'home_goals' => 2,
        'away_goals' => 1,
    ]);

    $this
        ->actingAs($viewer)
        ->get(route('users.predictions', $owner))
        ->assertForbidden();
});

test('a viewer cannot see predictions of a user with hidden leaderboards', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $owner = User::factory()->create();
    $viewer = User::factory()->create();
    $owner->userPreference()->update([
        'show_on_leaderboards' => false,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'home_goals' => 2,
        'away_goals' => 1,
    ]);

    $this
        ->actingAs($viewer)
        ->get(route('users.predictions', $owner))
        ->assertForbidden();
});

test('a viewer can see a public user prediction insight', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $owner = User::factory()->create();
    $viewer = User::factory()->create();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'home_goals' => 2,
        'away_goals' => 1,
    ]);

    $this
        ->actingAs($viewer)
        ->get(route('predictions.user.show', ['fixture' => $fixture, 'user' => $owner]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('mode', 'mine')
            ->where('match.userPrediction.homeScore', 2),
        );
});

test('a viewer cannot see a private user prediction insight', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $owner = User::factory()->create();
    $viewer = User::factory()->create();
    $owner->userPreference()->update([
        'predictions_visibility' => 'private',
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $owner->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'home_goals' => 2,
        'away_goals' => 1,
    ]);

    $this
        ->actingAs($viewer)
        ->get(route('predictions.user.show', ['fixture' => $fixture, 'user' => $owner]))
        ->assertForbidden();
});

test('leaderboard excludes users with show_on_leaderboards false', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $visibleUser = User::factory()->create(['name' => 'Visible']);
    $hiddenUser = User::factory()->create(['name' => 'Hidden']);
    $hiddenUser->userPreference()->update([
        'show_on_leaderboards' => false,
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $visibleUser->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
        'points_awarded_at' => now('UTC'),
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $hiddenUser->id,
        'source' => PredictionTypes::User->value,
        'points' => 20,
        'points_awarded_at' => now('UTC'),
    ]);

    $this
        ->actingAs($visibleUser)
        ->get(route('leaderboards'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('globalLeaderboard', 2)
            ->where('globalLeaderboard.0.id', $visibleUser->id)
            ->where('globalLeaderboard.0.predictionsArePublic', true)
            ->where('globalLeaderboard.0.showOnLeaderboards', true)
            ->where('totalPlayers', 2),
        );
});

test('leaderboard includes public predictions href for public users', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $user = User::factory()->create();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
        'points_awarded_at' => now('UTC'),
    ]);

    $this
        ->actingAs($user)
        ->get(route('leaderboards'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('globalLeaderboard', 2)
            ->where('globalLeaderboard.0.predictionsArePublic', true)
            ->where('globalLeaderboard.0.publicPredictionsHref', route('users.predictions', $user))
            ->where('globalLeaderboard.1.publicPredictionsHref', null),
        );
});

test('leaderboard excludes public predictions href for private users', function () {
    DB::table('user_preferences')->delete();
    DB::table('users')->where('is_system_user', false)->delete();
    $fixture = createUserPredictionFixture();
    $user = User::factory()->create();
    $user->userPreference()->update([
        'predictions_visibility' => 'private',
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'source' => PredictionTypes::User->value,
        'points' => 10,
        'points_awarded_at' => now('UTC'),
    ]);

    $this
        ->actingAs($user)
        ->get(route('leaderboards'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leaderboards')
            ->has('globalLeaderboard', 2)
            ->where('globalLeaderboard.0.predictionsArePublic', false)
            ->where('globalLeaderboard.0.publicPredictionsHref', null)
            ->where('globalLeaderboard.1.publicPredictionsHref', null),
        );
});
