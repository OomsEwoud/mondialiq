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
        ->get(route('predictions.mine.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('mode', 'mine')
            ->where('match.id', $fixture->id)
            ->where('match.homeTeam', 'Mexico')
            ->where('match.awayTeam', 'South Africa')
            ->where('match.userPrediction.label', 'Mexico')
            ->where('match.userPrediction.homeScore', 3)
            ->where('match.userPrediction.awayScore', 2)
            ->where('match.userPrediction.confidence', 'low'));
});

test('a user can view a dedicated ai prediction page', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createFixtureForPredictionDetails();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::Ai->value,
        'home_chance' => 49,
        'draw_chance' => 28,
        'away_chance' => 23,
        'home_goals' => 1,
        'away_goals' => 0,
        'confidence' => 63,
        'advice' => 'AI outcome: home_or_draw. The market leans home.',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('predictions.ai.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('mode', 'ai')
            ->where('match.id', $fixture->id)
            ->where('match.aiPrediction.label', 'Mexico')
            ->where('match.aiPrediction.homeScore', 1)
            ->where('match.aiPrediction.awayScore', 0)
            ->where('match.aiPrediction.confidence', '63')
            ->where('match.aiPrediction.advice', 'AI outcome: home_or_draw. The market leans home.')
            ->where('aiContext.marketOdds.home_win_probability', null)
            ->where('aiContext.apiPrediction', null));
});

test('a dedicated ai prediction page shows ai mode when only an ai prediction exists', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createFixtureForPredictionDetails();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::Ai->value,
        'home_chance' => 49,
        'draw_chance' => 28,
        'away_chance' => 23,
    ]);

    $this
        ->actingAs($user)
        ->get(route('predictions.ai.show', $fixture))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('mode', 'ai'));
});

test('the dedicated prediction page requires authentication', function () {
    [$fixture] = createFixtureForPredictionDetails();

    $this->get(route('predictions.mine.show', $fixture))
        ->assertRedirect(route('login'));
});

test('a user cannot view a dedicated prediction page for a fixture without any prediction', function () {
    $user = User::factory()->create();
    [$fixture] = createFixtureForPredictionDetails();

    $this->actingAs($user)
        ->get(route('predictions.mine.show', $fixture))
        ->assertNotFound();
});
