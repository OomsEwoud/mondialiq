<?php

use App\Services\Prediction\PredictionScoreService;

test('it scores all outcome combinations correctly', function (
    int $predictedHomeScore,
    int $predictedAwayScore,
    int $actualHomeScore,
    int $actualAwayScore,
    int $expectedScore,
) {
    $score = predictionScoreService()->calculate(
        $predictedHomeScore,
        $predictedAwayScore,
        $actualHomeScore,
        $actualAwayScore,
    );

    expect($score)->toBe($expectedScore);
})->with([
    'exact home win' => [2, 1, 2, 1, 20],
    'exact draw' => [1, 1, 1, 1, 20],
    'exact away win' => [0, 2, 0, 2, 20],
    'home predicted and home actual' => [3, 1, 2, 1, 11],
    'home predicted and draw actual' => [2, 1, 1, 1, 3],
    'home predicted and away actual' => [2, 1, 1, 2, 2],
    'draw predicted and home actual' => [1, 1, 2, 1, 3],
    'draw predicted and draw actual' => [1, 1, 2, 2, 12],
    'draw predicted and away actual' => [1, 1, 1, 2, 3],
    'away predicted and home actual' => [1, 2, 2, 1, 2],
    'away predicted and draw actual' => [1, 2, 1, 1, 3],
    'away predicted and away actual' => [1, 3, 1, 2, 11],
]);

test('it awards each partial scoring rule independently', function (
    int $predictedHomeScore,
    int $predictedAwayScore,
    int $actualHomeScore,
    int $actualAwayScore,
    int $expectedScore,
) {
    $score = predictionScoreService()->calculate(
        $predictedHomeScore,
        $predictedAwayScore,
        $actualHomeScore,
        $actualAwayScore,
    );

    expect($score)->toBe($expectedScore);
})->with([
    'correct outcome only' => [4, 1, 2, 0, 8],
    'correct outcome and goal difference' => [3, 2, 2, 1, 12],
    'correct home goals only' => [2, 4, 2, 1, 3],
    'correct away goals only' => [0, 1, 2, 1, 3],
    'correct total goals only' => [3, 0, 1, 2, 2],
    'correct outcome and total goals' => [3, 0, 2, 1, 10],
    'correct draw has no separate draw bonus' => [1, 1, 2, 2, 12],
]);

test('it always returns a score between zero and twenty for common football scores', function () {
    foreach (range(0, 6) as $predictedHomeScore) {
        foreach (range(0, 6) as $predictedAwayScore) {
            foreach (range(0, 6) as $actualHomeScore) {
                foreach (range(0, 6) as $actualAwayScore) {
                    $score = predictionScoreService()->calculate(
                        $predictedHomeScore,
                        $predictedAwayScore,
                        $actualHomeScore,
                        $actualAwayScore,
                    );

                    expect($score)->toBeGreaterThanOrEqual(0)
                        ->and($score)->toBeLessThanOrEqual(20);
                }
            }
        }
    }
});

test('it gives exactly twenty only for exact score predictions in common football scores', function () {
    foreach (range(0, 6) as $predictedHomeScore) {
        foreach (range(0, 6) as $predictedAwayScore) {
            foreach (range(0, 6) as $actualHomeScore) {
                foreach (range(0, 6) as $actualAwayScore) {
                    $score = predictionScoreService()->calculate(
                        $predictedHomeScore,
                        $predictedAwayScore,
                        $actualHomeScore,
                        $actualAwayScore,
                    );
                    $isExactScore = $predictedHomeScore === $actualHomeScore
                        && $predictedAwayScore === $actualAwayScore;

                    expect($score === 20)->toBe($isExactScore);
                }
            }
        }
    }
});

function predictionScoreService(): PredictionScoreService
{
    return new PredictionScoreService();
}
