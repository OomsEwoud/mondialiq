<?php

use App\Services\Prediction\PredictionScoreService;

test('exact score gives 20 points', function () {
    $score = app(PredictionScoreService::class)->calculate(2, 1, 2, 1);

    expect($score)->toBe(20);
});

test('correct winner but wrong score gives partial points', function () {
    $score = app(PredictionScoreService::class)->calculate(3, 1, 2, 1);

    expect($score)->toBe(11);
});

test('correct draw gets outcome and goal difference points', function () {
    $score = app(PredictionScoreService::class)->calculate(1, 1, 2, 2);

    expect($score)->toBe(12);
});

test('wrong outcome can still get points for exact team goals', function () {
    $score = app(PredictionScoreService::class)->calculate(2, 1, 1, 1);

    expect($score)->toBe(3);
});

test('score never exceeds 20', function () {
    $score = app(PredictionScoreService::class)->calculate(0, 0, 0, 0);

    expect($score)->toBe(20);
});

test('total goals points work correctly', function () {
    $score = app(PredictionScoreService::class)->calculate(3, 0, 1, 2);

    expect($score)->toBe(2);
});
