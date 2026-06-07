<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\ScoreboardPrediction;

class UserPredictionScoringService
{
    private const MAX_POINTS = 20;

    public function __construct(
        private readonly PredictionScoreService $predictionScoreService,
    ) {}

    public function previewPoints(Fixture $fixture, Prediction $prediction): ?int
    {
        return $this->previewBreakdown($fixture, $prediction)['total'] ?? null;
    }

    public function previewBreakdown(Fixture $fixture, Prediction $prediction): ?array
    {
        if ($prediction->hasAwardedPoints()) {
            return null;
        }

        if ($prediction->home_goals === null || $prediction->away_goals === null) {
            return null;
        }

        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return null;
        }

        return $this->predictionScoreService->breakdown(
            (int) $prediction->home_goals,
            (int) $prediction->away_goals,
            $fixture->fulltime_home_goals,
            $fixture->fulltime_away_goals,
        );
    }

    public function maxPoints(): int
    {
        return self::MAX_POINTS;
    }

    public function scoreFixture(Fixture $fixture): array
    {
        if (! $this->hasFinishedStatus($fixture)) {
            return [
                'scored' => 0,
                'skipped' => $fixture->userPredictions()->whereNull('points_awarded_at')->count(),
                'missing_final_score' => false,
            ];
        }

        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return [
                'scored' => 0,
                'skipped' => $fixture->userPredictions()->whereNull('points_awarded_at')->count(),
                'missing_final_score' => true,
            ];
        }

        $scored = 0;
        $skipped = 0;

        $fixture->userPredictions()
            ->whereNull('points_awarded_at')
            ->with(['user.scoreboards'])
            ->orderBy('id')
            ->get()
            ->each(function (Prediction $prediction) use ($fixture, &$scored, &$skipped): void {
                if ($prediction->home_goals === null || $prediction->away_goals === null) {
                    $prediction->forceFill([
                        'points' => 0,
                        'points_awarded_at' => now('UTC'),
                    ])->save();

                    $this->scoreScoreboardPredictions($prediction, $fixture, 0);
                    $skipped++;

                    return;
                }

                $globalPoints = $this->predictionScoreService->calculate(
                    (int) $prediction->home_goals,
                    (int) $prediction->away_goals,
                    $fixture->fulltime_home_goals,
                    $fixture->fulltime_away_goals,
                );

                $prediction->forceFill([
                    'points' => $globalPoints,
                    'points_awarded_at' => now('UTC'),
                ])->save();

                $this->scoreScoreboardPredictions($prediction, $fixture, $globalPoints);
                $scored++;
            });

        return [
            'scored' => $scored,
            'skipped' => $skipped,
            'missing_final_score' => false,
        ];
    }

    private function scoreScoreboardPredictions(Prediction $prediction, Fixture $fixture, int $globalPoints): void
    {
        $user = $prediction->user;

        if ($user === null) {
            return;
        }

        $scoreboards = $user->scoreboards;

        if ($scoreboards === null || $scoreboards->isEmpty()) {
            return;
        }

        foreach ($scoreboards as $scoreboard) {
            $this->updateScoreboardPrediction($prediction, $fixture, $scoreboard, $globalPoints);
        }
    }

    private function updateScoreboardPrediction(
        Prediction $prediction,
        Fixture $fixture,
        Scoreboard $scoreboard,
        int $globalPoints,
    ): void {
        $rules = $scoreboard->scoring_rules ?? [];
        $hasCustomRules = ! empty($rules);

        if ($hasCustomRules) {
            $basePoints = $this->predictionScoreService->calculateWithRules(
                (int) $prediction->home_goals,
                (int) $prediction->away_goals,
                $fixture->fulltime_home_goals,
                $fixture->fulltime_away_goals,
                $rules,
            );
        } else {
            $basePoints = $globalPoints;
        }

        $scoreboardPrediction = ScoreboardPrediction::query()
            ->where('scoreboard_id', $scoreboard->id)
            ->where('prediction_id', $prediction->id)
            ->first();

        $isBoosted = $scoreboardPrediction?->is_boosted ?? false;
        $bonus = 0;

        if ($isBoosted && ($scoreboard->scoringRule('boosted_predictions_enabled') ?? false)) {
            $breakdown = $this->predictionScoreService->breakdownWithRules(
                (int) $prediction->home_goals,
                (int) $prediction->away_goals,
                $fixture->fulltime_home_goals,
                $fixture->fulltime_away_goals,
                $rules,
            );

            if ($breakdown['correctOutcome']) {
                $confidenceValue = $this->numericConfidence($prediction->confidence);
                $threshold = (int) $scoreboard->scoringRule('boosted_confidence_threshold', 70);

                if ($confidenceValue !== null && $confidenceValue >= $threshold) {
                    $bonus = (int) $scoreboard->scoringRule('boosted_prediction_bonus_points', 2);
                }
            }
        }

        if ($scoreboardPrediction === null) {
            ScoreboardPrediction::create([
                'scoreboard_id' => $scoreboard->id,
                'prediction_id' => $prediction->id,
                'is_boosted' => $isBoosted,
                'points' => $basePoints + $bonus,
                'points_awarded_at' => now('UTC'),
            ]);
        } else {
            $scoreboardPrediction->forceFill([
                'points' => $basePoints + $bonus,
                'points_awarded_at' => now('UTC'),
            ])->save();
        }
    }

    private function numericConfidence(?string $confidence): ?int
    {
        return match ($confidence) {
            'high' => 100,
            'medium' => 50,
            'low' => 25,
            default => is_numeric($confidence) ? (int) $confidence : null,
        };
    }

    private function hasFinishedStatus(Fixture $fixture): bool
    {
        return in_array($fixture->status_short, Fixture::FINISHED_STATUS_SHORTS, true);
    }
}
