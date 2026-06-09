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
        'status_short' => 'NS',
        'status_long' => 'Not Started',
        'fulltime_home_goals' => null,
        'fulltime_away_goals' => null,
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
            ->where('match.userPrediction.confidence', 'low')
            ->where('scoringPreview', null));
});

test('a pending user prediction page can show a scoring preview without persisting points', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createFixtureForPredictionDetails();

    $fixture->forceFill([
        'status_short' => '1H',
        'status_long' => 'First Half',
        'fulltime_home_goals' => 1,
        'fulltime_away_goals' => 0,
    ])->save();

    $prediction = Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 2,
        'away_goals' => 0,
        'total_goals' => 2,
        'confidence' => 'high',
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('predictions.mine.show', $fixture));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('match.userPrediction.points', null)
            ->where('match.userPrediction.pointsAwarded', false)
            ->where('scoringPreview.points', 11)
            ->where('scoringPreview.maxPoints', 20)
            ->where('scoringPreview.breakdown.total', 11)
            ->where('scoringPreview.breakdown.items.0.label', 'Correct outcome')
            ->where('scoringPreview.breakdown.items.0.earned', true)
            ->where('scoringPreview.breakdown.items.2.label', 'Home team goals')
            ->where('scoringPreview.breakdown.items.2.earned', false)
            ->where('scoringPreview.breakdown.items.3.label', 'Away team goals')
            ->where('scoringPreview.breakdown.items.3.earned', true));

    expect($prediction->refresh()->points)->toBe(0)
        ->and($prediction->points_awarded_at)->toBeNull();
});

test('a pending user prediction page omits the scoring preview without score data', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createFixtureForPredictionDetails();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 0,
        'total_goals' => 1,
    ]);

    $this
        ->actingAs($user)
        ->get(route('predictions.mine.show', $fixture))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('scoringPreview', null));
});

test('a validated user prediction page keeps showing official stored points', function () {
    $user = User::factory()->create();
    [$fixture, $homeTeam] = createFixtureForPredictionDetails();

    $fixture->forceFill([
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 1,
        'fulltime_away_goals' => 0,
    ])->save();

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 0,
        'total_goals' => 1,
        'points' => 20,
        'points_awarded_at' => now('UTC'),
    ]);

    $this
        ->actingAs($user)
        ->get(route('predictions.mine.show', $fixture))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('prediction-show')
            ->where('match.userPrediction.points', 20)
            ->where('match.userPrediction.pointsAwarded', true)
            ->where('scoringPreview', null));
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

test('a user gets 404 for a non world cup fixture prediction page', function () {
    $user = User::factory()->create();

    $otherLeague = League::create([
        'external_id' => 9999,
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::create([
        'name' => 'Liverpool',
        'code' => 'LIV',
        'logo_url' => 'https://example.com/liverpool.png',
    ]);

    $awayTeam = Team::create([
        'name' => 'Chelsea',
        'code' => 'CHE',
        'logo_url' => 'https://example.com/chelsea.png',
    ]);

    $fixture = Fixture::create([
        'external_id' => 9001,
        'league_id' => $otherLeague->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-11 21:00:00',
        'status_short' => 'NS',
        'status_long' => 'Not Started',
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 2,
        'away_goals' => 1,
        'total_goals' => 3,
    ]);

    $this->actingAs($user)
        ->get(route('predictions.mine.show', $fixture))
        ->assertNotFound();
});
