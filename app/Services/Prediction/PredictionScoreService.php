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
        return $this->calculateWithRules(
            $predictedHomeScore,
            $predictedAwayScore,
            $actualHomeScore,
            $actualAwayScore,
            $this->defaultRules(),
        );
    }

    public function breakdown(
        int $predictedHomeScore,
        int $predictedAwayScore,
        int $actualHomeScore,
        int $actualAwayScore,
    ): array {
        return $this->breakdownWithRules(
            $predictedHomeScore,
            $predictedAwayScore,
            $actualHomeScore,
            $actualAwayScore,
            $this->defaultRules(),
        );
    }

    public function calculateWithRules(
        int $predictedHomeScore,
        int $predictedAwayScore,
        int $actualHomeScore,
        int $actualAwayScore,
        array $rules,
    ): int {
        return $this->breakdownWithRules(
            $predictedHomeScore,
            $predictedAwayScore,
            $actualHomeScore,
            $actualAwayScore,
            $rules,
        )['total'];
    }

    public function breakdownWithRules(
        int $predictedHomeScore,
        int $predictedAwayScore,
        int $actualHomeScore,
        int $actualAwayScore,
        array $rules,
    ): array {
        $exactScorePoints = $rules['exact_score_points'] ?? 20;

        if ($predictedHomeScore === $actualHomeScore && $predictedAwayScore === $actualAwayScore) {
            return [
                'exactScore' => true,
                'correctOutcome' => true,
                'correctGoalDifference' => true,
                'correctHomeGoals' => true,
                'correctAwayGoals' => true,
                'correctTotalGoals' => true,
                'total' => $exactScorePoints,
                'items' => [
                    [
                        'label' => 'Exact score',
                        'description' => 'You predicted the full-time score perfectly.',
                        'points' => $exactScorePoints,
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
            rules: $rules,
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
            'total' => min($this->earnedPoints($items), $exactScorePoints),
            'items' => $items,
        ];
    }

    private function defaultRules(): array
    {
        return [
            'exact_score_points' => 20,
            'correct_result_points' => 8,
            'correct_goal_difference_points' => 4,
            'correct_home_goals_points' => 3,
            'correct_away_goals_points' => 3,
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
        array $rules,
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
                'points' => $rules['correct_result_points'] ?? 8,
                'earned' => $correctOutcome,
            ],
            [
                'label' => 'Goal difference',
                'description' => 'Correct goal difference between both teams.',
                'points' => $rules['correct_goal_difference_points'] ?? 4,
                'earned' => $correctGoalDifference,
            ],
            [
                'label' => 'Home team goals',
                'description' => 'Correct amount of goals for the home team.',
                'points' => $rules['correct_home_goals_points'] ?? 3,
                'earned' => $correctHomeGoals,
            ],
            [
                'label' => 'Away team goals',
                'description' => 'Correct amount of goals for the away team.',
                'points' => $rules['correct_away_goals_points'] ?? 3,
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
