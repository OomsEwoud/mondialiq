<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;
use App\Models\Team;
use App\Models\User;
use App\Models\UserPreference;
use Inertia\Testing\AssertableInertia as Assert;

function createLeagueMemberFixture(): Fixture
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
        'external_id' => 100,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Finished',
    ]);
}

test('a league member can view another member\'s public predictions', function () {
    $fixture = createLeagueMemberFixture();

    $viewer = User::factory()->create(['name' => 'Viewer']);
    $member = User::factory()->create(['name' => 'Member']);

    $league = Scoreboard::create([
        'name' => 'Test League',
        'code' => 'TEST0001',
    ]);

    $league->users()->attach([$viewer->id, $member->id]);

    $prediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $prediction->id,
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', ['scoreboard' => $league, 'user' => $member]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-member-predictions')
            ->where('league.name', 'Test League')
            ->where('member.name', 'Member')
            ->where('member.isViewer', false)
            ->where('member.predictionsCount', 1)
            ->where('member.totalPoints', 10)
            ->has('fixtures.data', 1)
        );
});

test('a league member can view their own predictions', function () {
    $fixture = createLeagueMemberFixture();

    $member = User::factory()->create(['name' => 'Self Viewer']);

    $league = Scoreboard::create([
        'name' => 'Self League',
        'code' => 'SELF0001',
    ]);

    $league->users()->attach($member->id);

    $prediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'points' => 20,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $prediction->id,
        'points' => 20,
        'points_awarded_at' => now()->subHour(),
    ]);

    $this->actingAs($member)
        ->get(route('leagues.member.predictions', ['scoreboard' => $league, 'user' => $member]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-member-predictions')
            ->where('member.name', 'Self Viewer')
            ->where('member.isViewer', false)
            ->where('member.predictionsCount', 1)
            ->where('member.totalPoints', 20)
            ->has('fixtures.data', 1)
        );
});

test('a non-member cannot view league member predictions', function () {
    $fixture = createLeagueMemberFixture();

    $outsider = User::factory()->create(['name' => 'Outsider']);
    $member = User::factory()->create(['name' => 'Member']);

    $league = Scoreboard::create([
        'name' => 'Private League',
        'code' => 'PRIV0001',
    ]);

    $league->users()->attach($member->id);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
    ]);

    $this->actingAs($outsider)
        ->get(route('leagues.member.predictions', ['scoreboard' => $league, 'user' => $member]))
        ->assertForbidden();
});

test('a non-authenticated user is redirected to login', function () {
    $member = User::factory()->create();

    $league = Scoreboard::create([
        'name' => 'Login League',
        'code' => 'LOGIN001',
    ]);

    $league->users()->attach($member->id);

    $this->get(route('leagues.member.predictions', ['scoreboard' => $league, 'user' => $member]))
        ->assertRedirect(route('login'));
});

test('private predictions are hidden from other members when group visibility is disabled', function () {
    $fixture = createLeagueMemberFixture();

    $viewer = User::factory()->create(['name' => 'Viewer']);
    $member = User::factory()->create(['name' => 'Private Member']);

    UserPreference::create([
        'user_id' => $member->id,
        'predictions_visibility' => 'private',
        'allow_group_visibility' => false,
    ]);

    $league = Scoreboard::create([
        'name' => 'Hidden League',
        'code' => 'HIDDEN01',
    ]);

    $league->users()->attach([$viewer->id, $member->id]);

    $publicPrediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $publicPrediction->id,
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    $privatePrediction = Prediction::create([
        'fixture_id' => Fixture::create([
            'external_id' => 101,
            'league_id' => $fixture->league_id,
            'home_team_id' => $fixture->home_team_id,
            'away_team_id' => $fixture->away_team_id,
            'round_name' => 'Group Stage - Matchday 2',
            'season' => config('services.api_football.season'),
            'match_date' => '2026-06-15 20:00:00',
            'status_long' => 'Finished',
        ])->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'points' => 20,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $privatePrediction->id,
        'points' => 20,
        'points_awarded_at' => now()->subHour(),
    ]);

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', ['scoreboard' => $league, 'user' => $member]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-member-predictions')
            ->where('member.predictionsCount', 1)
            ->where('member.totalPoints', 10)
            ->has('fixtures.data', 1)
        );
});

test('private predictions are visible to other members when group visibility is enabled', function () {
    $fixture = createLeagueMemberFixture();

    $viewer = User::factory()->create(['name' => 'Viewer']);
    $member = User::factory()->create(['name' => 'Open Member']);

    UserPreference::create([
        'user_id' => $member->id,
        'predictions_visibility' => 'private',
        'allow_group_visibility' => true,
    ]);

    $league = Scoreboard::create([
        'name' => 'Open League',
        'code' => 'OPEN0001',
    ]);

    $league->users()->attach([$viewer->id, $member->id]);

    $publicPrediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $publicPrediction->id,
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    $privatePrediction = Prediction::create([
        'fixture_id' => Fixture::create([
            'external_id' => 102,
            'league_id' => $fixture->league_id,
            'home_team_id' => $fixture->home_team_id,
            'away_team_id' => $fixture->away_team_id,
            'round_name' => 'Group Stage - Matchday 2',
            'season' => config('services.api_football.season'),
            'match_date' => '2026-06-15 20:00:00',
            'status_long' => 'Finished',
        ])->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'private',
        'points' => 20,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $privatePrediction->id,
        'points' => 20,
        'points_awarded_at' => now()->subHour(),
    ]);

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', ['scoreboard' => $league, 'user' => $member]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('league-member-predictions')
            ->where('member.predictionsCount', 2)
            ->where('member.totalPoints', 30)
            ->has('fixtures.data', 2)
        );
});

test('points state filter filters fixtures correctly', function () {
    $fixture = createLeagueMemberFixture();

    $viewer = User::factory()->create(['name' => 'Viewer']);
    $member = User::factory()->create(['name' => 'Member']);

    $league = Scoreboard::create([
        'name' => 'Filter League',
        'code' => 'FILTER01',
    ]);

    $league->users()->attach([$viewer->id, $member->id]);

    $earnedPrediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $earnedPrediction->id,
        'points' => 10,
        'points_awarded_at' => now()->subHour(),
    ]);

    $noPointsFixture = Fixture::create([
        'external_id' => 103,
        'league_id' => $fixture->league_id,
        'home_team_id' => $fixture->home_team_id,
        'away_team_id' => $fixture->away_team_id,
        'round_name' => 'Group Stage - Matchday 2',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-15 20:00:00',
        'status_long' => 'Finished',
    ]);

    $noPointsPrediction = Prediction::create([
        'fixture_id' => $noPointsFixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
        'points' => 0,
        'points_awarded_at' => now()->subHour(),
    ]);

    ScoreboardPrediction::create([
        'scoreboard_id' => $league->id,
        'prediction_id' => $noPointsPrediction->id,
        'points' => 0,
        'points_awarded_at' => now()->subHour(),
    ]);

    $pendingFixture = Fixture::create([
        'external_id' => 104,
        'league_id' => $fixture->league_id,
        'home_team_id' => $fixture->home_team_id,
        'away_team_id' => $fixture->away_team_id,
        'round_name' => 'Group Stage - Matchday 3',
        'season' => config('services.api_football.season'),
        'match_date' => now()->addDays(2)->toDateTimeString(),
        'status_long' => 'Not Started',
    ]);

    Prediction::create([
        'fixture_id' => $pendingFixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
    ]);

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', [
            'scoreboard' => $league,
            'user' => $member,
            'pointsState' => 'points-earned',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('fixtures.data', 1)
        );

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', [
            'scoreboard' => $league,
            'user' => $member,
            'pointsState' => 'no-points-earned',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('fixtures.data', 1)
        );

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', [
            'scoreboard' => $league,
            'user' => $member,
            'pointsState' => 'points-pending',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('fixtures.data', 1)
        );
});

test('filters are passed correctly to the page', function () {
    $fixture = createLeagueMemberFixture();

    $viewer = User::factory()->create(['name' => 'Viewer']);
    $member = User::factory()->create(['name' => 'Member']);

    $league = Scoreboard::create([
        'name' => 'Filter Pass League',
        'code' => 'FPASS001',
    ]);

    $league->users()->attach([$viewer->id, $member->id]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $member->id,
        'source' => PredictionTypes::User->value,
        'visibility' => 'public',
    ]);

    $this->actingAs($viewer)
        ->get(route('leagues.member.predictions', [
            'scoreboard' => $league,
            'user' => $member,
            'status' => 'past',
            'date' => '2026-06-12',
            'pointsState' => 'points-earned',
        ]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('filters.status', 'past')
            ->where('filters.date', '2026-06-12')
            ->where('filters.pointsState', 'points-earned')
        );
});
