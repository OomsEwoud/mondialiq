<?php

use App\Models\Prediction;
use App\Services\Prediction\ApiPredictionSummaryService;

test('it parses winner advice', function () {
    $summary = app(ApiPredictionSummaryService::class)->summarize(new Prediction([
        'advice' => 'Winner : Manchester City',
    ]));

    expect($summary['api_advice'])->toBe('Winner: Manchester City')
        ->and($summary['api_predicted_outcome'])->toBe('Manchester City win')
        ->and($summary['api_goal_trend'])->toBeNull();
});

test('it parses double chance advice', function () {
    $summary = app(ApiPredictionSummaryService::class)->summarize(new Prediction([
        'advice' => 'Double chance : Liverpool or draw',
    ]));

    expect($summary['api_advice'])->toBe('Double chance: Liverpool or draw')
        ->and($summary['api_predicted_outcome'])->toBe('Liverpool or draw')
        ->and($summary['api_goal_trend'])->toBeNull();
});

test('it parses combo winner advice with over goals', function () {
    $summary = app(ApiPredictionSummaryService::class)->summarize(new Prediction([
        'advice' => 'Combo Winner : Bournemouth and +2.5 goals',
    ]));

    expect($summary['api_advice'])->toBe('Combo Winner: Bournemouth and +2.5 goals')
        ->and($summary['api_predicted_outcome'])->toBe('Bournemouth win')
        ->and($summary['api_goal_trend'])->toBe('over 2.5');
});

test('it parses combo double chance advice with under goals', function () {
    $summary = app(ApiPredictionSummaryService::class)->summarize(new Prediction([
        'advice' => 'Combo Double chance : Arsenal or draw and -3.5 goals',
    ]));

    expect($summary['api_advice'])->toBe('Combo Double chance: Arsenal or draw and -3.5 goals')
        ->and($summary['api_predicted_outcome'])->toBe('Arsenal or draw')
        ->and($summary['api_goal_trend'])->toBe('under 3.5');
});

test('it handles null fields safely', function () {
    $summary = app(ApiPredictionSummaryService::class)->summarize(new Prediction());

    expect($summary)->toBe([
        'api_advice' => null,
        'api_home_chance' => null,
        'api_draw_chance' => null,
        'api_away_chance' => null,
        'api_predicted_outcome' => null,
        'api_goal_trend' => null,
        'api_confidence' => null,
        'api_total_goals_line' => null,
        'api_home_goals_line' => null,
        'api_away_goals_line' => null,
        'api_goal_line' => null,
        'api_home_goal_line' => null,
        'api_away_goal_line' => null,
    ]);
});

test('it formats the prompt block', function () {
    $prediction = new Prediction([
        'advice' => 'Double chance : Liverpool or draw',
        'home_chance' => 50,
        'draw_chance' => 50,
        'away_chance' => 0,
        'confidence' => null,
    ]);

    $promptBlock = app(ApiPredictionSummaryService::class)->promptBlock($prediction);

    expect($promptBlock)->toBe(implode(PHP_EOL, [
        'API prediction summary:',
        '- API advice: Double chance: Liverpool or draw',
        '- API home chance: 50%',
        '- API draw chance: 50%',
        '- API away chance: 0%',
        '- API predicted outcome: Liverpool or draw',
        '- API goal trend: not available',
        '- API confidence: not available',
    ]));
});

test('it includes api goal lines in the summary and prompt block', function () {
    $prediction = new Prediction([
        'total_goals' => 2.5,
        'home_goals' => 1.5,
        'away_goals' => 0.5,
    ]);

    $service = app(ApiPredictionSummaryService::class);
    $summary = $service->summarize($prediction);

    expect($summary['api_total_goals_line'])->toBe(2.5)
        ->and($summary['api_home_goals_line'])->toBe(1.5)
        ->and($summary['api_away_goals_line'])->toBe(0.5)
        ->and($summary['api_goal_line'])->toBe(2.5)
        ->and($summary['api_home_goal_line'])->toBe(1.5)
        ->and($summary['api_away_goal_line'])->toBe(0.5)
        ->and($service->promptBlock($prediction))->toContain('- API total goals line: 2.5')
        ->and($service->promptBlock($prediction))->toContain('- API home goals line: 1.5')
        ->and($service->promptBlock($prediction))->toContain('- API away goals line: 0.5');
});
