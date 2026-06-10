<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Prediction;
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
                'skipped' => $fixture->predictions()->whereNull('points_awarded_at')->count(),
                'missing_final_score' => false,
            ];
        }

        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return [
                'scored' => 0,
                'skipped' => $fixture->predictions()->whereNull('points_awarded_at')->count(),
                'missing_final_score' => true,
            ];
        }

        $scored = 0;
        $skipped = 0;

        $fixture->predictions()
            ->whereIn('source', ['user', 'ai'])
            ->whereNull('points_awarded_at')
            ->with(['user.scoreboards', 'fixture'])
            ->orderBy('id')
            ->get()
            ->each(function (Prediction $prediction) use (&$scored, &$skipped): void {
                if ($prediction->home_goals === null || $prediction->away_goals === null) {
                    $prediction->forceFill([
                        'points' => 0,
                        'points_awarded_at' => now('UTC'),
                    ])->save();

                    $skipped++;

                    return;
                }

                $prediction->forceFill([
                    'points' => $this->predictionScoreService->calculate(
                        (int) $prediction->home_goals,
                        (int) $prediction->away_goals,
                        $prediction->fixture->fulltime_home_goals,
                        $prediction->fixture->fulltime_away_goals,
                    ),
                    'points_awarded_at' => now('UTC'),
                ])->save();

                $scored++;
            });

        return [
            'scored' => $scored,
            'skipped' => $skipped,
            'missing_final_score' => false,
        ];
    }

    public function syncScoreboardPredictions(Prediction $prediction): void
    {
        if (! in_array($prediction->source->value, ['user', 'ai'], true)) {
            return;
        }

        if ($prediction->points_awarded_at === null) {
            return;
        }

        $fixture = $prediction->fixture;
        $user = $prediction->user;

        if ($fixture === null || $user === null) {
            return;
        }

        if (! $this->hasFinishedStatus($fixture)) {
            return;
        }

        if ($fixture->fulltime_home_goals === null || $fixture->fulltime_away_goals === null) {
            return;
        }

        if ($prediction->home_goals === null || $prediction->away_goals === null) {
            $this->writeScoreboardPoints($prediction, $fixture, 0);

            return;
        }

        $globalPoints = $this->predictionScoreService->calculate(
            (int) $prediction->home_goals,
            (int) $prediction->away_goals,
            $fixture->fulltime_home_goals,
            $fixture->fulltime_away_goals,
        );

        $this->writeScoreboardPoints($prediction, $fixture, $globalPoints);
    }

    private function writeScoreboardPoints(Prediction $prediction, Fixture $fixture, int $globalPoints): void
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

            $isBoosted = ! $user->is_system_user && ($scoreboardPrediction?->is_boosted ?? false);
            $bonus = 0;

            if ($isBoosted && $scoreboard->boostedPredictionsEnabled()) {
                $breakdown = $this->predictionScoreService->breakdownWithRules(
                    (int) $prediction->home_goals,
                    (int) $prediction->away_goals,
                    $fixture->fulltime_home_goals,
                    $fixture->fulltime_away_goals,
                    $rules,
                );

                if ($breakdown['correctOutcome']) {
                    $confidenceValue = $this->numericConfidence($prediction->confidence);
                    $thresholdString = $scoreboard->boostedConfidenceThreshold();
                    $threshold = $this->numericConfidence($thresholdString);

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
