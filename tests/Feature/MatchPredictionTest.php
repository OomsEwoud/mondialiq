<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-06-01 12:00:00'));
});

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-06-01 12:00:00'));
});

function createPredictionFixture(string $matchDate = '2026-06-12 20:00:00'): array
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

    $fixture = Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => $matchDate,
        'status_long' => 'Not Started',
    ]);

    return [$fixture, $homeTeam, $awayTeam];
}

test('a logged in user can create a match prediction', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createPredictionFixture();

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'home_score' => 2,
            'away_score' => 1,
            'confidence' => 'high',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('predictions', [
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
        'confidence' => 'high',
    ]);
});

test('saving again updates the existing match prediction', function () {
    $user = User::factory()->create();
    [$fixture,, $awayTeam] = createPredictionFixture();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => null,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 1,
        'total_goals' => 2,
        'confidence' => 'low',
    ]);

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'away',
            'home_score' => 0,
            'away_score' => 2,
            'confidence' => 'medium',
        ])
        ->assertRedirect();

    expect(Prediction::whereBelongsTo($user)->whereBelongsTo($fixture)->count())->toBe(1);

    $this->assertDatabaseHas('predictions', [
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $awayTeam->id,
        'home_goals' => 0,
        'away_goals' => 2,
        'total_goals' => 2,
        'confidence' => 'medium',
    ]);
});

test('a prediction cannot be saved after the match starts', function () {
    $user = User::factory()->create();
    [$fixture] = createPredictionFixture('2020-06-12 20:00:00');

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'draw',
        ])
        ->assertSessionHasErrors('outcome');

    expect(Prediction::query()->count())->toBe(0);
});

test('the predicted score must match the selected outcome', function (
    string $outcome,
    int $homeScore,
    int $awayScore,
) {
    $user = User::factory()->create();
    [$fixture] = createPredictionFixture();

    $this
        ->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => $outcome,
            'home_score' => $homeScore,
            'away_score' => $awayScore,
        ])
        ->assertSessionHasErrors('outcome');

    expect(Prediction::query()->count())->toBe(0);
})->with([
    'home pick with away score win' => ['home', 0, 2],
    'away pick with home score win' => ['away', 2, 0],
    'draw pick with home score win' => ['draw', 2, 1],
    'home pick with draw score' => ['home', 1, 1],
]);

test('the match prediction endpoint is rate limited', function () {
    $middleware = app('router')
        ->getRoutes()
        ->getByName('matches.prediction.store')
        ->gatherMiddleware();

    expect($middleware)->toContain('auth')
        ->and($middleware)->toContain('throttle:prediction-store');
});

test('a non member cannot save a prediction for a group', function (string $visibility, bool $boosted) {
    $user = User::factory()->create();
    [$fixture] = createPredictionFixture(now()->addDay()->toDateTimeString());
    $scoreboard = Scoreboard::create([
        'name' => 'Another group',
        'code' => 'SECURE01',
        'visibility' => $visibility,
    ]);

    $this->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'scoreboard_id' => $scoreboard->id,
            'is_boosted' => $boosted,
        ])
        ->assertSessionHasErrors('scoreboard_id');

    $this->assertDatabaseCount('predictions', 0);
    $this->assertDatabaseCount('scoreboard_predictions', 0);
})->with(['private', 'public'])->with([false, true]);

test('a group member or owner can save a prediction for their group', function (string $role) {
    $user = User::factory()->create();
    [$fixture] = createPredictionFixture(now()->addDay()->toDateTimeString());
    $scoreboard = Scoreboard::create([
        'name' => 'My group',
        'code' => 'MEMBER01',
        'owner_id' => $role === 'owner' ? $user->id : null,
    ]);
    $scoreboard->users()->attach($user->id, ['role' => $role]);

    $this->actingAs($user)
        ->post(route('matches.prediction.store', $fixture), [
            'outcome' => 'home',
            'scoreboard_id' => $scoreboard->id,
            'is_boosted' => false,
        ])
        ->assertRedirect()
        ->assertSessionHasNoErrors();

    $prediction = Prediction::whereBelongsTo($user)->whereBelongsTo($fixture)->sole();

    $this->assertDatabaseHas('scoreboard_predictions', [
        'scoreboard_id' => $scoreboard->id,
        'prediction_id' => $prediction->id,
        'is_boosted' => false,
    ]);
})->with(['member', 'owner']);
