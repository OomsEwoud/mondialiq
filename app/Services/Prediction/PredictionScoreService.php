<?php

namespace App\Services\Prediction;

class PredictionScoreService
{
    public function calculate(
        int $predictedHomeScore,
        int $predictedAwayScore,
        int $actualHomeScore,
        int $actualAwayScore,
    ): int {
        // Exact scores are capped immediately at the maximum match score.
        if ($predictedHomeScore === $actualHomeScore && $predictedAwayScore === $actualAwayScore) {
            return 20;
        }

        $score = 0;
        $predictedOutcome = $this->getOutcome($predictedHomeScore, $predictedAwayScore);
        $actualOutcome = $this->getOutcome($actualHomeScore, $actualAwayScore);

        // Confidence is stored for now, but it does not affect points yet.
        // Correct outcomes reward the winner/draw direction.
        if ($predictedOutcome === $actualOutcome) {
            $score += 8;
        }

        // Score shape rewards remain available even when the exact score misses.
        if (
            $this->getGoalDifference($predictedHomeScore, $predictedAwayScore)
            === $this->getGoalDifference($actualHomeScore, $actualAwayScore)
        ) {
            $score += 4;
        }

        if ($predictedHomeScore === $actualHomeScore) {
            $score += 3;
        }

        if ($predictedAwayScore === $actualAwayScore) {
            $score += 3;
        }

        if (
            $this->getTotalGoals($predictedHomeScore, $predictedAwayScore)
            === $this->getTotalGoals($actualHomeScore, $actualAwayScore)
        ) {
            $score += 2;
        }

        return min($score, 20);
    }

    private function getOutcome(int $homeScore, int $awayScore): string
    {
        return match (true) {
            $homeScore > $awayScore => 'home',
            $homeScore < $awayScore => 'away',
            default => 'draw',
        };
    }

    private function getGoalDifference(int $homeScore, int $awayScore): int
    {
        return $homeScore - $awayScore;
    }

    private function getTotalGoals(int $homeScore, int $awayScore): int
    {
        return $homeScore + $awayScore;
    }
}
