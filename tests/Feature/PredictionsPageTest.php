<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('an ai prediction can be shown on the predictions page', function () {
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
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'winner_id' => $homeTeam->id,
        'source' => PredictionTypes::Ai->value,
        'advice' => 'Belgium or draw',
        'home_chance' => 55,
        'draw_chance' => 25,
        'away_chance' => 20,
    ]);

    $response = $this->get(route('predictions', ['mode' => 'ai']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('mode', 'ai')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $fixture->id)
            ->where('fixtures.data.0.homeTeam', 'Belgium')
            ->where('fixtures.data.0.awayTeam', 'Netherlands')
            ->where('fixtures.data.0.prediction.homeWin', 55)
            ->where('fixtures.data.0.prediction.draw', 25)
            ->where('fixtures.data.0.prediction.awayWin', 20),
        );
});

test('ai predictions can be filtered to upcoming matches', function () {
    [$league, $homeTeam, $awayTeam] = createPredictionsPageContext();
    $upcomingFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 20,
        'match_date' => now('Europe/Brussels')->addDay()->format('Y-m-d H:i:s'),
        'status_short' => Fixture::NOT_STARTED_STATUS_SHORT,
        'status_long' => 'Not Started',
    ]);
    $finishedFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 21,
        'match_date' => now('Europe/Brussels')->subDay()->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    createPredictionsPageAiPrediction($upcomingFixture);
    createPredictionsPageAiPrediction($finishedFixture);

    $response = $this->get(route('predictions', [
        'mode' => 'ai',
        'status' => 'upcoming',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('mode', 'ai')
            ->where('filters.status', 'upcoming')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $upcomingFixture->id),
        );
});

test('ai predictions can be filtered to finished matches', function () {
    [$league, $homeTeam, $awayTeam] = createPredictionsPageContext();
    $upcomingFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 30,
        'match_date' => now('Europe/Brussels')->addDay()->format('Y-m-d H:i:s'),
        'status_short' => Fixture::NOT_STARTED_STATUS_SHORT,
        'status_long' => 'Not Started',
    ]);
    $finishedFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 31,
        'match_date' => now('Europe/Brussels')->subDay()->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    createPredictionsPageAiPrediction($upcomingFixture);
    createPredictionsPageAiPrediction($finishedFixture);

    $response = $this->get(route('predictions', [
        'mode' => 'ai',
        'status' => 'past',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('mode', 'ai')
            ->where('filters.status', 'past')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $finishedFixture->id),
        );
});

test('ai predictions can be filtered by fixture date', function () {
    [$league, $homeTeam, $awayTeam] = createPredictionsPageContext();
    $todayFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 35,
        'match_date' => '2026-06-05 20:00:00',
        'status_short' => Fixture::NOT_STARTED_STATUS_SHORT,
        'status_long' => 'Not Started',
    ]);
    $otherFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 36,
        'match_date' => '2026-06-06 20:00:00',
        'status_short' => Fixture::NOT_STARTED_STATUS_SHORT,
        'status_long' => 'Not Started',
    ]);

    createPredictionsPageAiPrediction($todayFixture);
    createPredictionsPageAiPrediction($otherFixture);

    $response = $this->get(route('predictions', [
        'mode' => 'ai',
        'date' => '2026-06-05',
    ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('filters.date', '2026-06-05')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $todayFixture->id),
        );
});

test('a user prediction can be shown on the predictions page', function () {
    $user = User::factory()->create();

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
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $awayTeam->id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 2,
    ]);

    $response = $this
        ->actingAs($user)
        ->get(route('predictions', ['mode' => 'mine']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('mode', 'mine')
            ->has('fixtures.data', 1)
            ->where('fixtures.data.0.id', $fixture->id)
            ->where('fixtures.data.0.userPrediction.label', 'Netherlands')
            ->where('fixtures.data.0.userPrediction.points', null)
            ->where('fixtures.data.0.userPrediction.pointsAwarded', false)
            ->where('fixtures.data.0.userPrediction.validatedAt', null)
        );
});

test('user prediction points are only exposed after scoring validation', function () {
    $user = User::factory()->create();
    [$league, $homeTeam, $awayTeam] = createPredictionsPageContext();

    $upcomingFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 40,
        'match_date' => now('Europe/Brussels')->addDay()->format('Y-m-d H:i:s'),
        'status_short' => Fixture::NOT_STARTED_STATUS_SHORT,
        'status_long' => 'Not Started',
    ]);
    $liveFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 41,
        'match_date' => now('Europe/Brussels')->subMinutes(30)->format('Y-m-d H:i:s'),
        'status_short' => '1H',
        'status_long' => 'First Half',
    ]);
    $finishedPendingFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 42,
        'match_date' => now('Europe/Brussels')->subDay()->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);
    $earnedFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 43,
        'match_date' => now('Europe/Brussels')->subDays(2)->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);
    $zeroPointsFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 44,
        'match_date' => now('Europe/Brussels')->subDays(3)->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);
    $legacyUnvalidatedPointsFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 45,
        'match_date' => now('Europe/Brussels')->subDays(4)->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    createPredictionsPageUserPrediction($user, $upcomingFixture, ['points' => 0]);
    createPredictionsPageUserPrediction($user, $liveFixture, ['points' => 0]);
    createPredictionsPageUserPrediction($user, $finishedPendingFixture, ['points' => 0]);
    createPredictionsPageUserPrediction($user, $earnedFixture, [
        'points' => 12,
        'points_awarded_at' => now('UTC'),
    ]);
    createPredictionsPageUserPrediction($user, $zeroPointsFixture, [
        'points' => 0,
        'points_awarded_at' => now('UTC'),
    ]);
    createPredictionsPageUserPrediction($user, $legacyUnvalidatedPointsFixture, ['points' => 12]);

    $response = $this
        ->actingAs($user)
        ->get(route('predictions', ['mode' => 'mine']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->has('fixtures.data', 6)
            ->where('fixtures.data.0.id', $legacyUnvalidatedPointsFixture->id)
            ->where('fixtures.data.0.userPrediction.points', null)
            ->where('fixtures.data.0.userPrediction.pointsAwarded', false)
            ->where('fixtures.data.0.userPrediction.validatedAt', null)
            ->where('fixtures.data.1.id', $zeroPointsFixture->id)
            ->where('fixtures.data.1.userPrediction.points', 0)
            ->where('fixtures.data.1.userPrediction.pointsAwarded', true)
            ->where('fixtures.data.2.id', $earnedFixture->id)
            ->where('fixtures.data.2.userPrediction.points', 12)
            ->where('fixtures.data.2.userPrediction.pointsAwarded', true)
            ->where('fixtures.data.3.id', $finishedPendingFixture->id)
            ->where('fixtures.data.3.userPrediction.points', null)
            ->where('fixtures.data.3.userPrediction.pointsAwarded', false)
            ->where('fixtures.data.4.id', $liveFixture->id)
            ->where('fixtures.data.4.userPrediction.points', null)
            ->where('fixtures.data.4.userPrediction.pointsAwarded', false)
            ->where('fixtures.data.5.id', $upcomingFixture->id)
            ->where('fixtures.data.5.userPrediction.points', null)
            ->where('fixtures.data.5.userPrediction.pointsAwarded', false),
        );
});

test('user predictions can be filtered by real points state', function (string $pointsState) {
    $user = User::factory()->create();
    [$league, $homeTeam, $awayTeam] = createPredictionsPageContext();

    $pendingFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 50,
        'match_date' => now('Europe/Brussels')->subDay()->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);
    $earnedFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 51,
        'match_date' => now('Europe/Brussels')->subDays(2)->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);
    $zeroPointsFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 52,
        'match_date' => now('Europe/Brussels')->subDays(3)->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);
    $legacyUnvalidatedPointsFixture = createPredictionsPageFixture($league, $homeTeam, $awayTeam, [
        'external_id' => 53,
        'match_date' => now('Europe/Brussels')->subDays(4)->format('Y-m-d H:i:s'),
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
    ]);

    createPredictionsPageUserPrediction($user, $pendingFixture, ['points' => 0]);
    createPredictionsPageUserPrediction($user, $earnedFixture, [
        'points' => 12,
        'points_awarded_at' => now('UTC'),
    ]);
    createPredictionsPageUserPrediction($user, $zeroPointsFixture, [
        'points' => 0,
        'points_awarded_at' => now('UTC'),
    ]);
    createPredictionsPageUserPrediction($user, $legacyUnvalidatedPointsFixture, ['points' => 12]);

    $fixtureIds = [
        'points-pending' => $legacyUnvalidatedPointsFixture->id,
        'points-earned' => $earnedFixture->id,
        'no-points-earned' => $zeroPointsFixture->id,
    ];

    $response = $this
        ->actingAs($user)
        ->get(route('predictions', [
            'mode' => 'mine',
            'pointsState' => $pointsState,
        ]));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('filters.pointsState', $pointsState)
            ->has('fixtures.data', $pointsState === 'points-pending' ? 2 : 1)
            ->where('fixtures.data.0.id', $fixtureIds[$pointsState]),
        );
})->with([
    'pending' => 'points-pending',
    'earned' => 'points-earned',
    'zero points' => 'no-points-earned',
]);

function createPredictionsPageContext(): array
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

    return [$league, $homeTeam, $awayTeam];
}

function createPredictionsPageFixture(
    League $league,
    Team $homeTeam,
    Team $awayTeam,
    array $overrides = [],
): Fixture {
    return Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
        ...$overrides,
    ]);
}

function createPredictionsPageAiPrediction(Fixture $fixture): Prediction
{
    return Prediction::create([
        'fixture_id' => $fixture->id,
        'winner_id' => $fixture->home_team_id,
        'source' => PredictionTypes::Ai->value,
        'advice' => 'Home team to win',
        'home_chance' => 55,
        'draw_chance' => 25,
        'away_chance' => 20,
    ]);
}

function createPredictionsPageUserPrediction(User $user, Fixture $fixture, array $overrides = []): Prediction
{
    return Prediction::create([
        'fixture_id' => $fixture->id,
        'user_id' => $user->id,
        'winner_id' => $fixture->home_team_id,
        'source' => PredictionTypes::User->value,
        'home_goals' => 1,
        'away_goals' => 0,
        ...$overrides,
    ]);
}

test('guest users do not see mine predictions results', function () {
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

    Fixture::create([
        'external_id' => 10,
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => config('services.api_football.season'),
        'match_date' => '2026-06-12 20:00:00',
        'status_long' => 'Not Started',
    ]);

    $response = $this->get(route('predictions', ['mode' => 'mine']));

    $response
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('predictions')
            ->where('mode', 'mine')
            ->has('fixtures.data', 0),
        );
});
