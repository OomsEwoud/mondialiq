<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Prediction\AiPredictionPromptBuilder;
use App\Services\Prediction\AiPredictionService;
use Mockery;
use Mockery\MockInterface;
use OpenAI\Laravel\Facades\OpenAI;

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

    OpenAI::shouldReceive('responses->create')
        ->once()
        ->with([
            'model' => 'gpt-5',
            'instructions' => 'system instructions',
            'input' => 'prediction context',
        ])
        ->andReturn((object) [
            'outputText' => json_encode([
                'predicted_outcome' => 'home',
                'home_chance' => 58,
                'draw_chance' => 24,
                'away_chance' => 18,
                'confidence' => 72,
                'expected_score' => '2-1',
                'explanation' => 'Market odds and team form favor the home team.',
                'key_factors' => ['market odds', 'team form'],
            ]),
        ]);

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

test('it accepts fenced json from openai', function () {
    $fixture = createAiPredictionServiceFixture();

    $this->mock(AiPredictionPromptBuilder::class, function (MockInterface $mock) {
        $mock->shouldReceive('instructions')->andReturn('system instructions');
        $mock->shouldReceive('context')->andReturn('prediction context');
    });

    OpenAI::shouldReceive('responses->create')
        ->once()
        ->andReturn((object) [
            'outputText' => implode(PHP_EOL, [
                '```json',
                '{',
                '  "predicted_outcome": "draw",',
                '  "home_chance": 34,',
                '  "draw_chance": 36,',
                '  "away_chance": 30,',
                '  "confidence": 55,',
                '  "expected_score": null,',
                '  "explanation": "The sources are close.",',
                '  "key_factors": []',
                '}',
                '```',
            ]),
        ]);

    $prediction = app(AiPredictionService::class)->predict($fixture);

    expect($prediction->winner_id)->toBeNull()
        ->and($prediction->draw_chance)->toBe(36.0)
        ->and($prediction->home_goals)->toBeNull()
        ->and($prediction->away_goals)->toBeNull();
});

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
