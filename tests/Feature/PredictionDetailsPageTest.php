<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

function createFixtureForPredictionDetails(): array
{
    $league = League::create([
        'external_id' => config('services.api_football.league_id'),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::create([
        'name' => 'Mexico',
        'code' => 'MEX',
        'logo_url' => 'https://example.com/mexico.png',
    ]);

    $awayTeam = Team::create([
        'name' => 'South Africa',
        'code' => 'RSA',
        'logo_url' => 'https://example.com/south-africa.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-11 21:00:00',
        'status_long' => 'Not Started',
    ]);

    return [$fixture, $homeTeam, $awayTeam];
}

test('a user can view a dedicated prediction page', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createFixtureForPredictionDetails();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 3,
        'away_goals' => 2,
        'total_goals' => 5,
        'confidence' => 'low',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('predictions.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('match.id', $fixture->id)
            ->where('match.homeTeam', 'Mexico')
            ->where('match.awayTeam', 'South Africa')
            ->where('match.userPrediction.label', 'Mexico')
            ->where('match.userPrediction.homeScore', 3)
            ->where('match.userPrediction.awayScore', 2)
            ->where('match.userPrediction.confidence', 'low'));
});

test('the dedicated prediction page requires authentication', function () {
    [$fixture] = createFixtureForPredictionDetails();

    $this->get(route('predictions.show', $fixture))
        ->assertRedirect(route('login'));
});

test('a user cannot view a dedicated prediction page for a fixture without their prediction', function () {
    $user = User::factory()->create();
    [$fixture] = createFixtureForPredictionDetails();

    $this->actingAs($user)
        ->get(route('predictions.show', $fixture))
        ->assertNotFound();
});
