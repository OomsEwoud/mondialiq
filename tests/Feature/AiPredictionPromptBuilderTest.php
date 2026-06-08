<?php

use App\Models\Fixture;
use App\Models\League;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Prediction\AiPredictionPromptBuilder;
use App\Services\Prediction\PredictionContextService;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

test('it builds a prompt with all prediction context sections', function () {
    $fixture = createAiPredictionPromptFixture();

    mockPredictionPromptContext($fixture, implode(PHP_EOL.PHP_EOL, [
        'Prediction context:',
        'Fixture:',
        '- Belgium vs Netherlands',
        'Market odds summary:',
        '- Home win probability: 52%',
        'API prediction summary:',
        '- API predicted outcome: Belgium win',
        'Team statistics summary:',
        '- Belgium form: W-W-D-W-L, recent form score 10/15',
        'Standings summary:',
        '- Belgium: 2nd, 18 points, +8 goal difference',
        'Head-to-head summary:',
        '- Total meetings: 8',
    ]));

    $prompt = app(AiPredictionPromptBuilder::class)->build($fixture);

    expect($prompt)->toContain('You are an AI football prediction analyst for MondialIQ.')
        ->and($prompt)->toContain('Market odds summary:')
        ->and($prompt)->toContain('API prediction summary:')
        ->and($prompt)->toContain('Team statistics summary:')
        ->and($prompt)->toContain('Standings summary:')
        ->and($prompt)->toContain('Head-to-head summary:');
});

test('it separates instructions from fixture context', function () {
    $fixture = createAiPredictionPromptFixture();

    mockPredictionPromptContext($fixture, 'Prediction context:');

    $builder = app(AiPredictionPromptBuilder::class);

    expect($builder->instructions())->toContain('You are an AI football prediction analyst for MondialIQ.')
        ->and($builder->instructions())->toContain('Expected JSON format:')
        ->and($builder->instructions())->not->toContain('Prediction context:')
        ->and($builder->context($fixture))->toBe('Prediction context:');
});

test('it contains stable json output instructions', function () {
    $fixture = createAiPredictionPromptFixture();

    mockPredictionPromptContext($fixture, 'Prediction context:');

    $prompt = app(AiPredictionPromptBuilder::class)->build($fixture);

    expect($prompt)->toContain('Return a JSON object only.')
        ->and($prompt)->toContain('Expected JSON format:')
        ->and($prompt)->toContain('"predicted_outcome": "home|draw|away"')
        ->and($prompt)->toContain('"predicted_home_score": 0')
        ->and($prompt)->toContain('"predicted_away_score": 0')
        ->and($prompt)->toContain('"home_chance": 0')
        ->and($prompt)->toContain('"draw_chance": 0')
        ->and($prompt)->toContain('"away_chance": 0')
        ->and($prompt)->toContain('"confidence": 0')
        ->and($prompt)->toContain('"explanation": ""')
        ->and($prompt)->toContain('"key_factors": []')
        ->and(AiPredictionPromptBuilder::EXPECTED_JSON_FORMAT)->toHaveKeys([
            'predicted_outcome',
            'predicted_home_score',
            'predicted_away_score',
            'home_chance',
            'draw_chance',
            'away_chance',
            'confidence',
            'explanation',
            'key_factors',
        ]);
});

test('it includes prediction guidance', function () {
    $fixture = createAiPredictionPromptFixture();

    mockPredictionPromptContext($fixture, 'Prediction context:');

    $prompt = app(AiPredictionPromptBuilder::class)->build($fixture);

    expect($prompt)->toContain('Treat market odds as the strongest external signal.')
        ->and($prompt)->toContain('Treat API predictions as a secondary signal.')
        ->and($prompt)->toContain('Use team stats, standings and head-to-head as supporting context.')
        ->and($prompt)->toContain('Do not assume the listed home team has home advantage.')
        ->and($prompt)->toContain('For World Cup matches, only host nations should receive a home-country advantage')
        ->and($prompt)->toContain('If market odds and API prediction disagree, mention the disagreement.')
        ->and($prompt)->toContain('The predicted score MUST match the predicted outcome.')
        ->and($prompt)->toContain('If predicted_outcome is home, predicted_home_score must be greater than predicted_away_score.')
        ->and($prompt)->toContain('If predicted_outcome is draw, both predicted scores must be equal.')
        ->and($prompt)->toContain('If predicted_outcome is away, predicted_away_score must be greater than predicted_home_score.')
        ->and($prompt)->toContain('Do not choose a draw only because API draw chance is high if market odds and API advice support one side.')
        ->and($prompt)->toContain('Do not claim certainty.')
        ->and($prompt)->toContain('Explain uncertainty where relevant.')
        ->and($prompt)->toContain('Most likely score is a supporting signal, not a hard rule.')
        ->and($prompt)->toContain('Use market most likely score only when it matches the final predicted outcome.');
});

test('it handles missing context safely', function () {
    $fixture = createAiPredictionPromptFixture();

    mockPredictionPromptContext($fixture, implode(PHP_EOL.PHP_EOL, [
        'Prediction context:',
        'Market odds summary:',
        '- Home win probability: not available',
        'API prediction summary:',
        '- API prediction data not available.',
        'Standings data not available.',
        'Head-to-head data not available.',

    ]));

    $prompt = app(AiPredictionPromptBuilder::class)->build($fixture);

    expect($prompt)->toContain('Home win probability: not available')
        ->and($prompt)->toContain('API prediction data not available.')
        ->and($prompt)->toContain('Standings data not available.')
        ->and($prompt)->toContain('Head-to-head data not available.');
});

test('it does not call external football api services', function () {
    $fixture = createAiPredictionPromptFixture();

    $this->mock(FootballApiService::class, function (MockInterface $mock) {
        $mock->shouldNotReceive('getFixturePrediction');
    });

    mockPredictionPromptContext($fixture, 'Prediction context:');

    app(AiPredictionPromptBuilder::class)->build($fixture);
});

function mockPredictionPromptContext(Fixture $fixture, string $contextBlock): void
{
    mock(PredictionContextService::class, function (MockInterface $mock) use ($fixture, $contextBlock) {
        $mock->shouldReceive('promptBlock')
            ->once()
            ->with(
                Mockery::on(fn (Fixture $givenFixture) => $givenFixture->is($fixture)),
                false,
            )
            ->andReturn($contextBlock);
    });
}

function createAiPredictionPromptFixture(): Fixture
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
