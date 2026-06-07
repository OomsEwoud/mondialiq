<?php

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\League;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\Venue;
use App\Services\Prediction\ApiPredictionSummaryService;
use App\Services\Prediction\FixtureOddsSummaryService;
use App\Services\Prediction\HeadToHeadSummaryService;
use App\Services\Prediction\MissingPlayersSummaryService;
use App\Services\Prediction\PredictionContextService;
use App\Services\Prediction\StandingsSummaryService;
use App\Services\Prediction\TeamStatsSummaryService;
use Mockery\MockInterface;

use function Pest\Laravel\mock;

test('it builds context when all sources exist', function () {
    $fixture = createPredictionContextFixture();
    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'source' => PredictionTypes::Api->value,
        'advice' => 'Double chance : Liverpool or draw',
    ]);

    mockPredictionContextSummaryServices();

    $context = app(PredictionContextService::class)->summarize($fixture);

    expect($context['fixture'])->toMatchArray([
        'home_team' => 'Liverpool',
        'away_team' => 'Bournemouth',
        'league' => 'Premier League',
        'season' => 2025,
        'round' => 'Regular Season - 1',
        'venue' => 'Anfield',
        'venue_city' => 'Liverpool',
    ])->and($context['market_odds'])->toBe(['home_win_probability' => 82.0])
        ->and($context['api_prediction'])->toBe(['api_predicted_outcome' => 'Liverpool or draw'])
        ->and($context['team_statistics'])->toBe(['home_team' => ['form' => 'WWDWL']])
        ->and($context['standings'])->toBe(['home_team' => ['rank' => 2]])
        ->and($context['head_to_head'])->toBe(['total_meetings' => 8])
        ->and($context['missing_players'])->toBe(['home_missing_count' => 1])
        ->and($context['guidance'])->toHaveCount(4);
});

test('it builds context when some sources are missing', function () {
    $fixture = createPredictionContextFixture();

    mockPredictionContextSummaryServices(expectApiPrediction: false);

    $context = app(PredictionContextService::class)->summarize($fixture);

    expect($context['api_prediction'])->toBeNull()
        ->and($context['market_odds'])->toBe(['home_win_probability' => null])
        ->and($context['head_to_head'])->toBe(['total_meetings' => null]);
});

test('it does not crash with incomplete fixture data', function () {
    $fixture = createPredictionContextFixture([
        'home_team_name' => 'Home team',
        'away_team_name' => 'Away team',
        'venue' => false,
    ]);
    $fixture->match_date = null;
    $fixture->round_name = null;

    mockPredictionContextSummaryServices(expectApiPrediction: false);

    $promptBlock = app(PredictionContextService::class)->promptBlock($fixture);

    expect($promptBlock)->toContain('Home team vs Away team')
        ->and($promptBlock)->toContain('Round not available')
        ->and($promptBlock)->toContain('Date not available');
});

test('prompt block contains all available sections', function () {
    $fixture = createPredictionContextFixture();
    Prediction::query()->create([
        'fixture_id' => $fixture->id,
        'source' => PredictionTypes::Api->value,
        'advice' => 'Winner : Liverpool',
    ]);

    mockPredictionContextSummaryServices();

    $promptBlock = app(PredictionContextService::class)->promptBlock($fixture);

    expect($promptBlock)->toContain('Prediction context:')
        ->and($promptBlock)->toContain('Fixture:')
        ->and($promptBlock)->toContain('Market odds summary:')
        ->and($promptBlock)->toContain('API prediction summary:')
        ->and($promptBlock)->toContain('Team statistics summary:')
        ->and($promptBlock)->toContain('Standings summary:')
        ->and($promptBlock)->toContain('Head-to-head summary:')
        ->and($promptBlock)->toContain('Missing players summary:')
        ->and($promptBlock)->toContain('Guidance:')
        ->and($promptBlock)->toContain('If sources disagree, explain the disagreement.');
});

test('prompt block can omit guidance for ai input', function () {
    $fixture = createPredictionContextFixture();

    mockPredictionContextSummaryServices(expectApiPrediction: false);

    $promptBlock = app(PredictionContextService::class)->promptBlock($fixture, includeGuidance: false);

    expect($promptBlock)->toContain('Prediction context:')
        ->and($promptBlock)->toContain('Market odds summary:')
        ->and($promptBlock)->not->toContain('Guidance:')
        ->and($promptBlock)->not->toContain('If sources disagree, explain the disagreement.');
});

test('prompt block marks finals as likely neutral venue context', function () {
    $fixture = createPredictionContextFixture(['round_name' => 'Final']);

    mockPredictionContextSummaryServices(expectApiPrediction: false);

    $promptBlock = app(PredictionContextService::class)->promptBlock($fixture, includeGuidance: false);

    expect($promptBlock)->toContain('Venue context: Likely neutral venue; do not treat the listed home team as having home advantage.');
});

function mockPredictionContextSummaryServices(bool $expectApiPrediction = true): void
{
    mock(FixtureOddsSummaryService::class, function (MockInterface $mock) use ($expectApiPrediction) {
        $mock->shouldReceive('summarize')->andReturn([
            'home_win_probability' => $expectApiPrediction ? 82.0 : null,
        ]);
        $mock->shouldReceive('promptBlock')->andReturn(implode(PHP_EOL, [
            'Market odds summary:',
            '- Home win probability: '.($expectApiPrediction ? '82%' : 'not available'),
        ]));
    });

    mock(ApiPredictionSummaryService::class, function (MockInterface $mock) use ($expectApiPrediction) {
        if (! $expectApiPrediction) {
            $mock->shouldNotReceive('summarize');
            $mock->shouldNotReceive('promptBlock');

            return;
        }

        $mock->shouldReceive('summarize')
            ->with(Mockery::type(Prediction::class))
            ->andReturn(['api_predicted_outcome' => 'Liverpool or draw']);
        $mock->shouldReceive('promptBlock')
            ->with(Mockery::type(Prediction::class))
            ->andReturn(implode(PHP_EOL, [
                'API prediction summary:',
                '- API predicted outcome: Liverpool or draw',
            ]));
    });

    mock(TeamStatsSummaryService::class, function (MockInterface $mock) {
        $mock->shouldReceive('summarize')->andReturn(['home_team' => ['form' => 'WWDWL']]);
        $mock->shouldReceive('promptBlock')->andReturn(implode(PHP_EOL, [
            'Team statistics summary:',
            '- Liverpool form: W-W-D-W-L, recent form score 10/15',
        ]));
    });

    mock(StandingsSummaryService::class, function (MockInterface $mock) {
        $mock->shouldReceive('summarize')->andReturn(['home_team' => ['rank' => 2]]);
        $mock->shouldReceive('promptBlock')->andReturn(implode(PHP_EOL, [
            'Standings summary:',
            '- Liverpool: 2nd, 74 points, +42 goal difference',
        ]));
    });

    mock(HeadToHeadSummaryService::class, function (MockInterface $mock) use ($expectApiPrediction) {
        $mock->shouldReceive('summarize')->andReturn([
            'total_meetings' => $expectApiPrediction ? 8 : null,
        ]);
        $mock->shouldReceive('promptBlock')->andReturn(implode(PHP_EOL, [
            'Head-to-head summary:',
            '- Total meetings: '.($expectApiPrediction ? '8' : 'not available'),
        ]));
    });

    mock(MissingPlayersSummaryService::class, function (MockInterface $mock) {
        $mock->shouldReceive('summarize')->andReturn(['home_missing_count' => 1]);
        $mock->shouldReceive('promptBlock')->andReturn(implode(PHP_EOL, [
            'Missing players summary:',
            '- Liverpool: 1 missing player',
        ]));
    });
}

function createPredictionContextFixture(array $overrides = []): Fixture
{
    $league = League::query()->create([
        'external_id' => fake()->unique()->numberBetween(1000, 9999),
        'name' => 'Premier League',
        'type' => 'League',
    ]);

    $homeTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(10000, 19999),
        'name' => $overrides['home_team_name'] ?? 'Liverpool',
        'code' => 'LIV',
        'logo_url' => 'https://example.com/liverpool.png',
    ]);

    $awayTeam = Team::query()->create([
        'external_id' => fake()->unique()->numberBetween(20000, 29999),
        'name' => $overrides['away_team_name'] ?? 'Bournemouth',
        'code' => 'BOU',
        'logo_url' => 'https://example.com/bournemouth.png',
    ]);

    $venueId = null;

    if (($overrides['venue'] ?? true) !== false) {
        $venue = Venue::query()->create([
            'external_id' => fake()->unique()->numberBetween(30000, 39999),
            'name' => 'Anfield',
            'city' => 'Liverpool',
        ]);

        $venueId = $venue->id;
    }

    return Fixture::query()->create([
        'external_id' => fake()->unique()->numberBetween(40000, 49999),
        'league_id' => $league->id,
        'home_team_id' => $homeTeam->id,
        'away_team_id' => $awayTeam->id,
        'venue_id' => $venueId,
        'round_name' => array_key_exists('round_name', $overrides) ? $overrides['round_name'] : 'Regular Season - 1',
        'season' => 2025,
        'match_date' => array_key_exists('match_date', $overrides) ? $overrides['match_date'] : '2025-08-15 19:00:00',
        'status_long' => 'Not Started',
    ]);
}
