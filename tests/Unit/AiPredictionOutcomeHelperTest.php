<?php

use App\Services\Prediction\AiPredictionOutcomeHelper;

test('it derives an outcome from score', function () {
    $helper = app(AiPredictionOutcomeHelper::class);

    expect($helper->getOutcomeFromScore(2, 1))->toBe('home')
        ->and($helper->getOutcomeFromScore(1, 1))->toBe('draw')
        ->and($helper->getOutcomeFromScore(0, 1))->toBe('away');
});

test('it normalizes common outcome labels', function () {
    $helper = app(AiPredictionOutcomeHelper::class);

    expect($helper->normalizeOutcome('home_win'))->toBe('home')
        ->and($helper->normalizeOutcome('away win'))->toBe('away')
        ->and($helper->normalizeOutcome('draw'))->toBe('draw')
        ->and($helper->normalizeOutcome('home_or_draw'))->toBe('home_or_draw')
        ->and($helper->normalizeOutcome('unknown'))->toBeNull();
});

test('it derives an outcome from prediction data', function () {
    $helper = app(AiPredictionOutcomeHelper::class);

    expect($helper->getOutcomeFromPredictionData([
        'predicted_outcome' => 'away win',
    ]))->toBe('away')
        ->and($helper->getOutcomeFromPredictionData([
            'predicted_outcome' => '',
        ]))->toBeNull();
});

test('it checks outcome compatibility with scores', function () {
    $helper = app(AiPredictionOutcomeHelper::class);

    expect($helper->isOutcomeCompatibleWithScore('home', 2, 1))->toBeTrue()
        ->and($helper->isOutcomeCompatibleWithScore('draw', 2, 1))->toBeFalse()
        ->and($helper->isOutcomeCompatibleWithScore('away', 1, 1))->toBeFalse()
        ->and($helper->isOutcomeCompatibleWithScore('home_or_draw', 1, 1))->toBeTrue()
        ->and($helper->isOutcomeCompatibleWithScore('away_or_draw', 0, 1))->toBeTrue();
});
