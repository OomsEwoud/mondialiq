<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Services\Prediction\AiPredictionPromptBuilder;
use App\Services\Prediction\AiPredictionService;
use Mockery\MockInterface;

test('it generates an ai prediction for a fixture', function () {
    $fixture = createGenerateAiPredictionFixture();
    $prediction = new Prediction([
        'home_chance' => 58,
        'draw_chance' => 24,
        'away_chance' => 18,
        'confidence' => 72,
        'home_goals' => 2,
        'away_goals' => 1,
    ]);
    $prediction->fixture_id = $fixture->id;

    $this->mock(AiPredictionService::class, function (MockInterface $mock) use ($fixture, $prediction) {
        $mock->shouldReceive('predict')
            ->once()
            ->with(Mockery::on(fn (Fixture $givenFixture) => $givenFixture->is($fixture)))
            ->andReturn($prediction);
    });

    $this->artisan("app:generate-ai-prediction {$fixture->id}")
        ->expectsOutput("AI prediction opgeslagen voor fixture {$fixture->id}.")
        ->expectsOutput('Home: 58%')
        ->expectsOutput('Draw: 24%')
        ->expectsOutput('Away: 18%')
        ->expectsOutput('Confidence: 72%')
        ->expectsOutput('Expected score: 2-1')
        ->assertSuccessful();
});

test('it can dry run the ai prediction prompt without calling openai', function () {
    $fixture = createGenerateAiPredictionFixture();

    $this->mock(AiPredictionService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('predict');
    });

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) use ($fixture) {
        $mock->shouldNotReceive('instructions');
        $mock->shouldReceive('context')
            ->once()
            ->with(Mockery::on(fn (Fixture $givenFixture) => $givenFixture->is($fixture)))
            ->andReturn('Prediction context:');
    });

    $this->artisan("app:generate-ai-prediction {$fixture->id} --dry-run")
        ->expectsOutput('OpenAI input:')
        ->expectsOutput('Prediction context:')
        ->assertSuccessful();
});

test('it can dry run the full openai payload with instructions', function () {
    $fixture = createGenerateAiPredictionFixture();

    $this->mock(AiPredictionService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('predict');
    });

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) use ($fixture) {
        $mock->shouldReceive('instructions')
            ->once()
            ->andReturn('You are an AI football prediction analyst for MondialIQ.');
        $mock->shouldReceive('context')
            ->once()
            ->with(Mockery::on(fn (Fixture $givenFixture) => $givenFixture->is($fixture)))
            ->andReturn('Prediction context:');
    });

    $this->artisan("app:generate-ai-prediction {$fixture->id} --dry-run --show-instructions")
        ->expectsOutput('OpenAI instructions:')
        ->expectsOutput('You are an AI football prediction analyst for MondialIQ.')
        ->expectsOutput('OpenAI input:')
        ->expectsOutput('Prediction context:')
        ->assertSuccessful();
});

test('it fails when generating an ai prediction for a missing fixture', function () {
    $this->mock(AiPredictionService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('predict');
    });

    $this->artisan('app:generate-ai-prediction 999999')
        ->expectsOutput('Fixture 999999 niet gevonden.')
        ->assertFailed();
});

function createGenerateAiPredictionFixture(): Fixture
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
