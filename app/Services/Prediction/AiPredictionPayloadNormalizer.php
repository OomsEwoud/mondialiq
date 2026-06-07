<?php

namespace App\Services\Prediction;

use Illuminate\Support\Arr;

class AiPredictionPayloadNormalizer
{
    public function __construct(
        private readonly AiPredictionOutcomeHelper $outcomeHelper,
    ) {}

    public function extractScores(array $payload): array
    {
        $homeScore = $this->nonNegativeInt(Arr::get($payload, 'predicted_home_score'));
        $awayScore = $this->nonNegativeInt(Arr::get($payload, 'predicted_away_score'));

        if ($homeScore !== null || $awayScore !== null) {
            return [$homeScore, $awayScore];
        }

        $expectedScore = Arr::get($payload, 'expected_score');

        if (! is_string($expectedScore) || trim($expectedScore) === '') {
            return [null, null];
        }

        if (preg_match('/^(?<home>\d+)\s*[-:]\s*(?<away>\d+)$/', trim($expectedScore), $matches) !== 1) {
            return [null, null];
        }

        return [
            $this->nonNegativeInt($matches['home']),
            $this->nonNegativeInt($matches['away']),
        ];
    }

    public function clampPercentage(mixed $value): ?float
    {
        if (! is_numeric($value)) {
            return null;
        }

        return max(0, min(100, round((float) $value, 2)));
    }

    public function stringOrFallback(mixed $value, string $fallback): string
    {
        if (! is_string($value) || trim($value) === '') {
            return $fallback;
        }

        return trim($value);
    }

    public function payloadWasCorrected(array $original, array $validated): bool
    {
        $originalHomeScore = $this->nonNegativeInt(Arr::get($original, 'predicted_home_score'));
        $originalAwayScore = $this->nonNegativeInt(Arr::get($original, 'predicted_away_score'));

        if ($originalHomeScore === null && $originalAwayScore === null) {
            [$originalHomeScore, $originalAwayScore] = $this->extractScores($original);
        }

        return $this->outcomeHelper->normalizeOutcome(Arr::get($original, 'predicted_outcome')) !== $validated['predicted_outcome']
            || $originalHomeScore !== $validated['predicted_home_score']
            || $originalAwayScore !== $validated['predicted_away_score']
            || $this->clampPercentage(Arr::get($original, 'confidence')) !== $validated['confidence'];
    }

    public function parseMarketMostLikelyScore(?string $score): ?array
    {
        if ($score === null || preg_match('/^(?<home>\d+)\s*[-:]\s*(?<away>\d+)$/', trim($score), $matches) !== 1) {
            return null;
        }

        return [(int) $matches['home'], (int) $matches['away']];
    }

    public function nonNegativeInt(mixed $value): ?int
    {
        if (! is_numeric($value)) {
            return null;
        }

        return max(0, (int) round((float) $value));
    }
}
