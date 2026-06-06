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
        return $this->breakdown(
            $predictedHomeScore,
            $predictedAwayScore,
            $actualHomeScore,
            $actualAwayScore,
        )['total'];
    }

    public function breakdown(
        int $predictedHomeScore,
        int $predictedAwayScore,
        int $actualHomeScore,
        int $actualAwayScore,
    ): array {
        // Exact scores are capped immediately at the maximum match score.
        if ($predictedHomeScore === $actualHomeScore && $predictedAwayScore === $actualAwayScore) {
            return [
                'exactScore' => true,
                'correctOutcome' => true,
                'correctGoalDifference' => true,
                'correctHomeGoals' => true,
                'correctAwayGoals' => true,
                'correctTotalGoals' => true,
                'total' => 20,
                'items' => [
                    [
                        'label' => 'Exact score',
                        'description' => 'You predicted the full-time score perfectly.',
                        'points' => 20,
                        'earned' => true,
                    ],
                ],
            ];
        }

        $predictedOutcome = $this->getOutcome($predictedHomeScore, $predictedAwayScore);
        $actualOutcome = $this->getOutcome($actualHomeScore, $actualAwayScore);
        $correctOutcome = $predictedOutcome === $actualOutcome;
        $correctGoalDifference = $this->getGoalDifference($predictedHomeScore, $predictedAwayScore)
            === $this->getGoalDifference($actualHomeScore, $actualAwayScore);
        $correctHomeGoals = $predictedHomeScore === $actualHomeScore;
        $correctAwayGoals = $predictedAwayScore === $actualAwayScore;
        $correctTotalGoals = $this->getTotalGoals($predictedHomeScore, $predictedAwayScore)
            === $this->getTotalGoals($actualHomeScore, $actualAwayScore);
        $items = $this->scoreItems(
            correctOutcome: $correctOutcome,
            correctGoalDifference: $correctGoalDifference,
            correctHomeGoals: $correctHomeGoals,
            correctAwayGoals: $correctAwayGoals,
            correctTotalGoals: $correctTotalGoals,
        );

        return [
            'exactScore' => false,
            'correctOutcome' => $correctOutcome,
            'correctGoalDifference' => $correctGoalDifference,
            'correctHomeGoals' => $correctHomeGoals,
            'correctAwayGoals' => $correctAwayGoals,
            'correctTotalGoals' => $correctTotalGoals,
            'total' => min($this->earnedPoints($items), 20),
            'items' => $items,
        ];
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

    private function scoreItems(
        bool $correctOutcome,
        bool $correctGoalDifference,
        bool $correctHomeGoals,
        bool $correctAwayGoals,
        bool $correctTotalGoals,
    ): array {
        return [
            [
                'label' => 'Correct outcome',
                'description' => 'Correct winner or correctly predicted a draw.',
                'points' => 8,
                'earned' => $correctOutcome,
            ],
            [
                'label' => 'Goal difference',
                'description' => 'Correct goal difference between both teams.',
                'points' => 4,
                'earned' => $correctGoalDifference,
            ],
            [
                'label' => 'Home team goals',
                'description' => 'Correct amount of goals for the home team.',
                'points' => 3,
                'earned' => $correctHomeGoals,
            ],
            [
                'label' => 'Away team goals',
                'description' => 'Correct amount of goals for the away team.',
                'points' => 3,
                'earned' => $correctAwayGoals,
            ],
            [
                'label' => 'Total goals',
                'description' => 'Correct total number of goals in the match.',
                'points' => 2,
                'earned' => $correctTotalGoals,
            ],
        ];
    }

    private function earnedPoints(array $items): int
    {
        return array_sum(array_map(
            fn (array $item): int => $item['earned'] ? $item['points'] : 0,
            $items,
        ));
    }
}
