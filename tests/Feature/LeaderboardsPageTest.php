<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\User;
use Carbon\CarbonImmutable;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->travelTo(CarbonImmutable::parse('2026-10-06 12:00:00', 'UTC'));
});

function createAiRankingPrediction(array $attributes = [], array $fixtureAttributes = []): Prediction
{
    $league = League::firstOrCreate(['name' => 'Premier League'], ['type' => 'League']);
    $home = Team::firstOrCreate(['name' => 'Home'], ['logo_url' => 'https://example.com/home.png']);
    $away = Team::firstOrCreate(['name' => 'Away'], ['logo_url' => 'https://example.com/away.png']);
    $fixture = Fixture::create([
        'league_id' => $league->id,
        'home_team_id' => $home->id,
        'away_team_id' => $away->id,
        'season' => 2026,
        'round_name' => 'Matchday 1',
        'match_date' => '2026-10-01 20:00:00',
        'status_short' => 'FT',
        'status_long' => 'Match Finished',
        'fulltime_home_goals' => 2,
        'fulltime_away_goals' => 1,
        ...$fixtureAttributes,
    ]);
    $prediction = new Prediction([
        'fixture_id' => $fixture->id,
        'source' => 'ai',
        'winner_id' => $home->id,
        'home_goals' => 2,
        'away_goals' => 1,
        'advice' => 'AI outcome: home. Analysis.',
        ...$attributes,
    ]);
    $prediction->created_at = CarbonImmutable::parse($fixture->kickoffAt())->utc()->subHour();
    $prediction->save();

    return $prediction;
}

test('AI rankings and the Dutch alias require authentication', function () {
    $this->get(route('leaderboards'))->assertRedirect(route('login'));
    $this->get('/ranglijsten')->assertRedirect(route('login'));
    $this->actingAs(User::factory()->create())->get('/ranglijsten')->assertRedirect('/leaderboards');
});

test('AI rankings have an honest empty state and no personal leaderboard data', function () {
    $this->actingAs(User::factory()->create())->get(route('leaderboards'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('leaderboards')->where('summary.accuracy', null)->where('summary.evaluatedCount', 0)
        ->has('competitionPerformance', 0)->has('recentPredictions', 0)->has('periodPerformance', 2)
        ->has('dailyPerformance', 30)->where('dailyPerformance.29.accuracy', null)
        ->where('filters.period', '30d')->where('filters.predictionType', 'all')
        ->missing('rankings')->missing('modelOptions')->missing('filters.model')
        ->missing('currentUserPosition')->missing('joinedLeagues')->missing('globalLeaderboard'));
});

test('AI rankings calculate real outcomes exact scores form and competition performance', function () {
    createAiRankingPrediction([], ['match_date' => '2026-09-28 20:00:00']);
    createAiRankingPrediction(['advice' => 'AI outcome: away.', 'home_goals' => 0, 'away_goals' => 1], ['match_date' => '2026-09-29 20:00:00']);
    createAiRankingPrediction(['home_goals' => 3]);
    createAiRankingPrediction(['source' => 'api', 'advice' => null, 'home_goals' => -1.5, 'away_goals' => -0.5]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 3)->where('summary.evaluatedCount', 3)
        ->where('summary.correctCount', 2)->where('summary.accuracy', 66.7)
        ->where('summary.outcomeAccuracy', 66.7)->where('summary.exactAccuracy', 33.3)
        ->has('competitionPerformance', 1)->where('competitionPerformance.0.evaluatedCount', 3)
        ->where('competitionPerformance.0.accuracy', 66.7)->has('teamPerformance', 2)
        ->where('teamPerformance.0.evaluatedCount', 3)->has('recentPredictions', 3)
        ->where('recentPredictions.0.predictedScore', '3–1')->where('recentPredictions.0.actualScore', '2–1')
        ->where('recentPredictions.0.correct', true)->where('recentPredictions.0.exactCorrect', false)
        ->where('recentPredictions.1.correct', false)->missing('rankings'));
});

test('unfinished incomplete and post kickoff predictions cannot inflate accuracy', function () {
    createAiRankingPrediction();
    createAiRankingPrediction([], ['status_short' => '1H', 'status_long' => 'First Half']);
    createAiRankingPrediction([], ['fulltime_home_goals' => null]);
    createAiRankingPrediction(['advice' => 'AI outcome: home_or_draw.']);
    $late = createAiRankingPrediction();
    $late->created_at = '2026-10-01 18:00:00'; // Kickoff is 20:00 Brussels, 18:00 UTC.
    $late->save();
    createAiRankingPrediction(['visibility' => 'private']);
    createAiRankingPrediction(['source' => 'user']);
    createAiRankingPrediction([], ['match_date' => '2026-10-07 20:00:00', 'status_short' => 'NS', 'status_long' => 'Not Started']);

    $this->actingAs(User::factory()->create())->get(route('leaderboards'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 5)->where('summary.evaluatedCount', 2)
        ->where('summary.accuracy', 100)->has('recentPredictions', 2));
});

test('external API predictions cannot affect single engine accuracy or exact scores', function () {
    createAiRankingPrediction(['source' => 'api', 'advice' => 'Winner: Home or draw', 'home_chance' => 20, 'draw_chance' => 60, 'away_chance' => 20], ['fulltime_home_goals' => 1, 'fulltime_away_goals' => 1]);
    createAiRankingPrediction(['source' => 'api', 'advice' => null, 'home_chance' => 40, 'draw_chance' => 40, 'away_chance' => 20]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.evaluatedCount', 0)->where('summary.correctCount', 0)
        ->where('summary.exactEligibleCount', 0)->where('summary.accuracy', null)
        ->has('recentPredictions', 0));
});

test('competition and period filters affect real AI performance', function () {
    $prediction = createAiRankingPrediction();
    createAiRankingPrediction(['source' => 'api', 'advice' => null]);
    createAiRankingPrediction([], ['match_date' => '2026-08-01 20:00:00']);
    $other = League::create(['name' => 'La Liga', 'type' => 'League']);
    createAiRankingPrediction([], ['league_id' => $other->id]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards', [
        'competition' => $prediction->fixture->league_id, 'period' => '30d', 'predictionType' => 'all',
    ]))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 1)
        ->has('competitionPerformance', 1)->where('filters.period', '30d')
        ->where('filters.competition', $prediction->fixture->league_id)->has('competitionOptions', 2));
});

test('the 30 day change compares two separate periods independently of the display period', function () {
    createAiRankingPrediction([], ['match_date' => '2026-09-01 20:00:00']);
    createAiRankingPrediction(['advice' => 'AI outcome: away.'], ['match_date' => '2026-09-02 20:00:00']);
    createAiRankingPrediction();

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['period' => '30d']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 1)->where('periodPerformance.1.change', 50));
});

test('AI rankings reject invalid filters', function (array $filters, string $field) {
    $this->actingAs(User::factory()->create())->from(route('leaderboards'))
        ->get(route('leaderboards', $filters))->assertRedirect(route('leaderboards'))->assertSessionHasErrors($field);
})->with([
    [['competition' => 999999], 'competition'],
    [['competition' => 'invalid'], 'competition'],
    [['period' => 'tomorrow'], 'period'],
    [['predictionType' => 'invented'], 'predictionType'],
    [['confidence' => 'guaranteed'], 'confidence'],
    [['team' => 999999], 'team'],
    [['team' => ['invalid']], 'team'],
]);

test('AI draws are assessed on full time results and missing or fractional scores are excluded from exact accuracy', function () {
    createAiRankingPrediction(['advice' => 'AI outcome: draw.', 'winner_id' => null, 'home_goals' => 1, 'away_goals' => 1], [
        'status_short' => 'AET', 'fulltime_home_goals' => 1, 'fulltime_away_goals' => 1,
        'extratime_home_goals' => 2, 'extratime_away_goals' => 1,
    ]);
    createAiRankingPrediction(['home_goals' => 2.5]);
    createAiRankingPrediction(['home_goals' => null, 'away_goals' => null]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.evaluatedCount', 3)->where('summary.correctCount', 3)
        ->where('summary.exactEligibleCount', 1)->where('summary.exactAccuracy', 100));
});

test('all periods include older predictions and recent performance is newest first', function () {
    foreach (range(1, 7) as $day) {
        createAiRankingPrediction(['advice' => $day === 1 ? 'AI outcome: away.' : 'AI outcome: home.'], [
            'match_date' => "2025-08-0{$day} 20:00:00",
        ]);
    }

    $user = User::factory()->create();
    $this->actingAs($user)->get(route('leaderboards', ['period' => '365d']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page->where('summary.evaluatedCount', 0));
    $this->get(route('leaderboards', ['period' => 'all']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 7)->where('summary.correctCount', 6)
        ->has('recentPredictions', 7)->where('recentPredictions.0.id', 7)
        ->where('recentPredictions.6.correct', false)->where('periodPerformance.1.change', null));
});

test('team filtering includes home and away appearances without including other matches', function () {
    $original = createAiRankingPrediction();
    $homeId = $original->fixture->home_team_id;
    $awayId = $original->fixture->away_team_id;
    $other = Team::create(['name' => 'Other', 'logo_url' => 'https://example.com/other.png']);
    createAiRankingPrediction(['advice' => 'AI outcome: away.'], ['home_team_id' => $other->id, 'away_team_id' => $homeId, 'fulltime_home_goals' => 0, 'fulltime_away_goals' => 1]);
    createAiRankingPrediction([], ['home_team_id' => $other->id, 'away_team_id' => $awayId]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['team' => $homeId]))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 2)->where('summary.accuracy', 100)
        ->where('filters.team', $homeId)->has('teamOptions', 3));
});

test('exact score filtering assesses both scores rather than just a winning team', function () {
    createAiRankingPrediction();
    createAiRankingPrediction(['home_goals' => 3]);
    createAiRankingPrediction(['home_goals' => null, 'away_goals' => null]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['predictionType' => 'exact']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 2)->where('summary.accuracy', 50)
        ->where('summary.outcomeAccuracy', 100)->where('summary.exactAccuracy', 50)
        ->where('typePerformance.0.evaluatedCount', 3)->where('typePerformance.1.evaluatedCount', 2)
        ->where('recentPredictions.0.correct', false)->where('recentPredictions.1.correct', true));
});

test('double chance performance is separate from single 1X2 outcomes', function () {
    createAiRankingPrediction(['advice' => 'AI outcome: home_or_draw.'], ['fulltime_home_goals' => 1, 'fulltime_away_goals' => 1]);
    createAiRankingPrediction(['advice' => 'AI outcome: away_or_draw.']);
    createAiRankingPrediction();

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['predictionType' => 'double_chance']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.evaluatedCount', 2)->where('summary.correctCount', 1)
        ->where('summary.accuracy', 50)->where('typePerformance.0.evaluatedCount', 1)
        ->where('typePerformance.2.evaluatedCount', 2)->where('recentPredictions.0.correct', false));
});

test('confidence boundaries and missing confidence have separate breakdowns', function (string $level, int $expectedCount) {
    foreach ([75, 100, 50, 74.99, 49.99, 0, null] as $confidence) {
        createAiRankingPrediction(['confidence' => $confidence]);
    }

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['confidence' => $level]))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.evaluatedCount', $expectedCount)->where('filters.confidence', $level)
        ->where('confidencePerformance.0.evaluatedCount', 2)->where('confidencePerformance.1.evaluatedCount', 2)
        ->where('confidencePerformance.2.evaluatedCount', 2)->where('confidencePerformance.3.evaluatedCount', 1));
})->with([['high', 2], ['medium', 2], ['low', 2], ['unknown', 1]]);

test('seven and thirty day trends compare separate previous periods independent of the page period', function () {
    createAiRankingPrediction([], ['match_date' => '2026-09-01 20:00:00']);
    createAiRankingPrediction(['advice' => 'AI outcome: away.'], ['match_date' => '2026-09-02 20:00:00']);
    createAiRankingPrediction([], ['match_date' => '2026-09-25 20:00:00']);
    createAiRankingPrediction(['advice' => 'AI outcome: away.'], ['match_date' => '2026-09-29 20:00:00']);
    createAiRankingPrediction();

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['period' => '7d']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.evaluatedCount', 2)->where('periodPerformance.0.days', 7)
        ->where('periodPerformance.0.current.accuracy', 50)->where('periodPerformance.0.previous.accuracy', 100)
        ->where('periodPerformance.0.change', -50)->where('periodPerformance.1.current.evaluatedCount', 3)
        ->where('periodPerformance.1.previous.evaluatedCount', 2)->where('periodPerformance.1.change', 16.7)
        ->where('dailyPerformance.29.accuracy', null));
});

test('competitions are ranked by AI accuracy and external references cannot alter the order', function () {
    createAiRankingPrediction();
    createAiRankingPrediction(['advice' => 'AI outcome: away.']);
    $league = League::create(['name' => 'Bundesliga', 'type' => 'League']);
    createAiRankingPrediction([], ['league_id' => $league->id]);
    createAiRankingPrediction(['source' => 'api', 'advice' => null], ['league_id' => $league->id]);

    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['model' => 'api']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 3)->where('competitionPerformance.0.name', 'Bundesliga')
        ->where('competitionPerformance.0.accuracy', 100)->where('competitionPerformance.0.evaluatedCount', 1)
        ->where('competitionPerformance.1.name', 'Premier League')->where('competitionPerformance.1.accuracy', 50));
});

test('recent prediction performance keeps only the latest twelve evaluated results', function () {
    foreach (range(1, 14) as $day) {
        createAiRankingPrediction([], ['match_date' => sprintf('2026-09-%02d 20:00:00', $day)]);
    }
    $this->actingAs(User::factory()->create())->get(route('leaderboards', ['period' => 'all']))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 14)->has('recentPredictions', 12)
        ->where('recentPredictions.0.id', 14)->where('recentPredictions.11.id', 3));
});

test('one engine counts only the latest public AI prediction for each fixture', function () {
    $original = createAiRankingPrediction();
    $latest = $original->replicate();
    $latest->created_at = $original->created_at;
    $latest->advice = 'AI outcome: away.';
    $latest->save();
    $private = $original->replicate();
    $private->created_at = $original->created_at;
    $private->visibility = 'private';
    $private->save();

    $this->actingAs(User::factory()->create())->get(route('leaderboards'))
        ->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('summary.predictionCount', 1)->where('summary.accuracy', 0)
        ->where('recentPredictions.0.id', $latest->id));
});
