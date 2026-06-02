<?php

use App\Enums\PredictionTypes;
use App\Models\BetType;
use App\Models\Bookmaker;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Prediction\AiPredictionPromptBuilder;
use App\Services\Prediction\AiPredictionService;
use App\Services\Prediction\OpenAiResponseClient;
use Illuminate\Support\Facades\Log;
use Mockery\MockInterface;
use function Pest\Laravel\mock;

test('it sends the built prompt to openai and stores the ai prediction', function () {
    $fixture = createAiPredictionServiceFixture();

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) use ($fixture) {
        $mock->shouldReceive('instructions')
            ->once()
            ->andReturn('system instructions');
        $mock->shouldReceive('context')
            ->once()
            ->with(Mockery::on(fn (Fixture $givenFixture) => $givenFixture->is($fixture)))
            ->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'home',
        'predicted_home_score' => 2,
        'predicted_away_score' => 1,
        'home_chance' => 58,
        'draw_chance' => 24,
        'away_chance' => 18,
        'confidence' => 72,
        'explanation' => 'Market odds and team form favor the home team.',
        'key_factors' => ['market odds', 'team form'],
    ], fn (array $parameters): bool => isset($parameters['model'])
        && $parameters['instructions'] === 'system instructions'
        && $parameters['input'] === 'prediction context');

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->fixture_id)->toBe($fixture->id)
        ->and($prediction->source)->toBe(PredictionTypes::Ai)
        ->and($prediction->winner_id)->toBe($fixture->home_team_id)
        ->and($prediction->home_chance)->toBe(58.0)
        ->and($prediction->draw_chance)->toBe(24.0)
        ->and($prediction->away_chance)->toBe(18.0)
        ->and($prediction->confidence)->toEqual(72)
        ->and($prediction->home_goals)->toBe(2.0)
        ->and($prediction->away_goals)->toBe(1.0)
        ->and($prediction->total_goals)->toBe(3.0)
        ->and($prediction->advice)->toContain('AI outcome: home.');
});

test('it stores the full ai advice text', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 49, draw: 28, away: 23, over: 48, btts: 47, mostLikelyScore: '1-0');
    $explanation = str_repeat('The market and API prediction both lean toward the home team avoiding defeat. ', 10);

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'home',
        'predicted_home_score' => 1,
        'predicted_away_score' => 0,
        'home_chance' => 49,
        'draw_chance' => 28,
        'away_chance' => 23,
        'confidence' => 62,
        'explanation' => $explanation,
        'key_factors' => ['market odds', 'api prediction'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->advice)->toContain(trim($explanation))
        ->and(strlen($prediction->advice))->toBeGreaterThan(255);
});

test('it maps double chance outcomes to the primary team and accepts colon scores', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 49, draw: 28, away: 23, over: 48, btts: 47, mostLikelyScore: '1-0');

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'home_or_draw',
        'predicted_home_score' => 1,
        'predicted_away_score' => 0,
        'home_chance' => 49,
        'draw_chance' => 28,
        'away_chance' => 23,
        'confidence' => 63,
        'explanation' => 'The market leans home or draw with a low score.',
        'key_factors' => ['market odds'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBe($fixture->home_team_id)
        ->and($prediction->home_goals)->toBe(1.0)
        ->and($prediction->away_goals)->toBe(0.0)
        ->and($prediction->total_goals)->toBe(1.0);
});

test('it accepts fenced json from openai', function () {
    $fixture = createAiPredictionServiceFixture();

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiRawResponse(implode(PHP_EOL, [
        '```json',
        '{',
        '  "predicted_outcome": "draw",',
        '  "predicted_home_score": 1,',
        '  "predicted_away_score": 1,',
        '  "home_chance": 34,',
        '  "draw_chance": 36,',
        '  "away_chance": 30,',
        '  "confidence": 55,',
        '  "explanation": "The sources are close.",',
        '  "key_factors": []',
        '}',
        '```',
    ]));

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBeNull()
        ->and($prediction->draw_chance)->toBe(36.0)
        ->and($prediction->home_goals)->toBe(1.0)
        ->and($prediction->away_goals)->toBe(1.0)
        ->and($prediction->total_goals)->toBe(2.0);
});

test('it corrects a home outcome when the returned score is a draw', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 54, draw: 25, away: 21, over: 62, btts: 59, mostLikelyScore: '2-1');
    Log::spy();

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'home',
        'predicted_home_score' => 1,
        'predicted_away_score' => 1,
        'home_chance' => 54,
        'draw_chance' => 25,
        'away_chance' => 21,
        'confidence' => 72,
        'explanation' => 'Home side has the stronger signal.',
        'key_factors' => ['market odds'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBe($fixture->home_team_id)
        ->and($prediction->home_goals)->toBe(2.0)
        ->and($prediction->away_goals)->toBe(1.0);

    Log::shouldHaveReceived('warning')
        ->once()
        ->with(
            'AI prediction payload corrected',
            Mockery::on(fn (array $context): bool => $context['fixture_id'] === $fixture->id
                && $context['original']['predicted_outcome'] === 'home'
                && $context['original']['predicted_home_score'] === 1
                && $context['original']['predicted_away_score'] === 1
                && $context['corrected']['predicted_outcome'] === 'home'
                && $context['corrected']['predicted_home_score'] === 2
                && $context['corrected']['predicted_away_score'] === 1
                && $context['corrected']['confidence'] === 72.0),
        );
});

test('it corrects an away outcome when the returned score is a draw', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 21, draw: 28, away: 51, over: 56, btts: 55, mostLikelyScore: '1-2');

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'away',
        'predicted_home_score' => 1,
        'predicted_away_score' => 1,
        'home_chance' => 21,
        'draw_chance' => 28,
        'away_chance' => 51,
        'confidence' => 68,
        'explanation' => 'Away side has the stronger signal.',
        'key_factors' => ['market odds'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBe($fixture->away_team_id)
        ->and($prediction->away_goals)->toBeGreaterThan($prediction->home_goals);
});

test('it corrects a draw outcome when the returned score is not a draw', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 30, draw: 41, away: 29, over: 42, btts: 44, mostLikelyScore: '1-1');

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'draw',
        'predicted_home_score' => 2,
        'predicted_away_score' => 1,
        'home_chance' => 30,
        'draw_chance' => 41,
        'away_chance' => 29,
        'confidence' => 61,
        'explanation' => 'Signals are tight.',
        'key_factors' => ['market odds'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBeNull()
        ->and($prediction->home_goals)->toEqual($prediction->away_goals);
});

test('it prefers away over draw when market strongly supports away and api advice supports away or draw', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 21, draw: 28, away: 51, over: 57, btts: 54, mostLikelyScore: '1-1');
    seedApiPrediction($fixture, 'Double chance : Netherlands or draw', 25, 45, 45, 66);

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'away_or_draw',
        'predicted_home_score' => 1,
        'predicted_away_score' => 1,
        'home_chance' => 21,
        'draw_chance' => 45,
        'away_chance' => 45,
        'confidence' => 105,
        'explanation' => 'API sees away or draw.',
        'key_factors' => ['market odds', 'api prediction'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBe($fixture->away_team_id)
        ->and($prediction->away_goals)->toBeGreaterThan($prediction->home_goals)
        ->and($prediction->confidence)->toBe(100.0);
});

test('it does not blindly reuse the market most likely draw score for an away outcome', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 22, draw: 30, away: 48, over: 55, btts: 56, mostLikelyScore: '1-1');

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'away',
        'predicted_home_score' => 1,
        'predicted_away_score' => 1,
        'home_chance' => 22,
        'draw_chance' => 30,
        'away_chance' => 48,
        'confidence' => 74,
        'explanation' => 'Away side edges the match.',
        'key_factors' => ['market odds'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->away_goals)->toBeGreaterThan($prediction->home_goals)
        ->and($prediction->home_goals === 1.0 && $prediction->away_goals === 1.0)->toBeFalse();
});

test('it supports legacy expected_score payloads and keeps them outcome-compatible', function () {
    $fixture = createAiPredictionServiceFixture();
    seedFixtureMarketOdds($fixture, home: 22, draw: 30, away: 48, over: 55, btts: 56, mostLikelyScore: '1-1');

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    mockOpenAiResponse([
        'predicted_outcome' => 'away',
        'expected_score' => '1:1',
        'home_chance' => 22,
        'draw_chance' => 30,
        'away_chance' => 48,
        'confidence' => 74,
        'explanation' => 'Away side edges the match.',
        'key_factors' => ['market odds'],
    ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBe($fixture->away_team_id)
        ->and($prediction->away_goals)->toBeGreaterThan($prediction->home_goals)
        ->and($prediction->total_goals)->toBe($prediction->home_goals + $prediction->away_goals);
});

function mockOpenAiResponse(array $prediction, ?callable $parameterExpectation = null): void
{
    mockOpenAiRawResponse(json_encode($prediction), $parameterExpectation);
}

function mockOpenAiRawResponse(string $outputText, ?callable $parameterExpectation = null): void
{
    $mock = mock(OpenAiResponseClient::class);
    $expectation = $mock->shouldReceive('create')->once();

    if ($parameterExpectation !== null) {
        $expectation->with(Mockery::on($parameterExpectation));
    }

    $expectation->andReturn((object) [
        'outputText' => $outputText,
    ]);
}

function createAiPredictionServiceFixture(): Fixture
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(1000, 9999),
        'name' => 'World Cup',
        'type' => 'Cup',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(10000, 19999),
        'name' => 'Belgium',
        'code' => 'BEL',
        'logo_url' => 'https://example.com/belgium.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(20000, 29999),
        'name' => 'Netherlands',
        'code' => 'NED',
        'logo_url' => 'https://example.com/netherlands.png',
    ]);

    return Fixture::query()->create([
        'external_id' => fake()->unique()->numberBetween(30000, 39999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'round_name' => 'Group Stage - Matchday 1',
        'season' => 2026,
        'match_date' => '2026-06-12 18:00:00',
        'status_long' => 'Not Started',
    ]);
}

function seedFixtureMarketOdds(
    Fixture $fixture,
    float $home,
    float $draw,
    float $away,
    float $over,
    float $btts,
    string $mostLikelyScore,
): void {
    $bookmaker = fake()->unique()->numberBetween(5000, 5999);

    createFixtureOdd($fixture, $bookmaker, 'Match Winner', 'Home', impliedOddFromProbability($home));
    createFixtureOdd($fixture, $bookmaker, 'Match Winner', 'Draw', impliedOddFromProbability($draw));
    createFixtureOdd($fixture, $bookmaker, 'Match Winner', 'Away', impliedOddFromProbability($away));
    createFixtureOdd($fixture, $bookmaker, 'Goals Over/Under', 'Over 2.5', impliedOddFromProbability($over));
    createFixtureOdd($fixture, $bookmaker, 'Goals Over/Under', 'Under 2.5', impliedOddFromProbability(max(1, 100 - $over)));
    createFixtureOdd($fixture, $bookmaker, 'Both Teams Score', 'Yes', impliedOddFromProbability($btts));
    createFixtureOdd($fixture, $bookmaker, 'Both Teams Score', 'No', impliedOddFromProbability(max(1, 100 - $btts)));
    createFixtureOdd($fixture, $bookmaker, 'Exact Score', $mostLikelyScore, 3.2);
    createFixtureOdd($fixture, $bookmaker, 'Exact Score', '0-0', 9.5);
}

function createFixtureOdd(
    Fixture $fixture,
    int $externalBookmakerId,
    string $betName,
    string $value,
    float $odd,
): void {
    $bookmaker = Bookmaker::query()->firstOrCreate([
        'name' => 'TestBookmaker-'.$externalBookmakerId,
    ]);
    $betType = BetType::query()->firstOrCreate([
        'name' => $betName,
    ]);

    \App\Models\FixtureOdd::query()->create([
        'fixture_id' => $fixture->id,
        'external_bookmaker_id' => $externalBookmakerId,
        'bookmaker_name' => $bookmaker->name,
        'external_bet_id' => abs(crc32($betName)),
        'bet_name' => $betName,
        'bookmaker_id' => $bookmaker->id,
        'bet_type_id' => $betType->id,
        'value' => $value,
        'odd' => $odd,
    ]);
}

function impliedOddFromProbability(float $probability): float
{
    return round(100 / max($probability, 1), 2);
}

function seedApiPrediction(
    Fixture $fixture,
    string $advice,
    float $homeChance,
    float $drawChance,
    float $awayChance,
    float $confidence,
): void {
    \App\Models\Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'user_id' => null,
        'winner_id' => null,
        'source' => PredictionTypes::Api->value,
        'home_chance' => $homeChance,
        'draw_chance' => $drawChance,
        'away_chance' => $awayChance,
        'confidence' => $confidence,
        'advice' => $advice,
    ]);
}
