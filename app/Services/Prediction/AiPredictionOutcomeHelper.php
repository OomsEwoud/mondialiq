<?php

namespace App\Services\Prediction;

class AiPredictionOutcomeHelper
{
    public function getOutcomeFromScore(?int $homeScore, ?int $awayScore): ?string
    {
        if ($homeScore === null || $awayScore === null) {
            return null;
        }

        return match (true) {
            $homeScore > $awayScore => 'home',
            $homeScore < $awayScore => 'away',
            default => 'draw',
        };
    }

    public function getOutcomeFromPredictionData(array $prediction): ?string
    {
        return $this->normalizeOutcome($prediction['predicted_outcome'] ?? null);
    }

    public function normalizeOutcome(mixed $outcome): ?string
    {
        if (! is_string($outcome) || trim($outcome) === '') {
            return null;
        }

        $normalized = mb_strtolower(trim($outcome));
        $normalized = str_replace(['-', ' '], '_', $normalized);

        return match ($normalized) {
            'home', 'home_win' => 'home',
            'draw' => 'draw',
            'away', 'away_win' => 'away',
            'home_or_draw' => 'home_or_draw',
            'away_or_draw' => 'away_or_draw',
            'home_or_away' => 'home_or_away',
            default => null,
        };
    }

    public function isOutcomeCompatibleWithScore(
        ?string $outcome,
        ?int $homeScore,
        ?int $awayScore,
    ): bool {
        $normalizedOutcome = $this->normalizeOutcome($outcome);
        $scoreOutcome = $this->getOutcomeFromScore($homeScore, $awayScore);

        if ($normalizedOutcome === null || $scoreOutcome === null) {
            return false;
        }

        return match ($normalizedOutcome) {
            'home' => $scoreOutcome === 'home',
            'draw' => $scoreOutcome === 'draw',
            'away' => $scoreOutcome === 'away',
            'home_or_draw' => in_array($scoreOutcome, ['home', 'draw'], true),
            'away_or_draw' => in_array($scoreOutcome, ['away', 'draw'], true),
            'home_or_away' => in_array($scoreOutcome, ['home', 'away'], true),
            default => false,
        };
    }
}
