<?php

namespace App\Services\Prediction;

use App\Models\Fixture;
use App\Models\Prediction;

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
            ->orderBy('id')
            ->get()
            ->each(function (Prediction $prediction) use ($fixture, &$scored, &$skipped): void {
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
                        $fixture->fulltime_home_goals,
                        $fixture->fulltime_away_goals,
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

    private function hasFinishedStatus(Fixture $fixture): bool
    {
        return in_array($fixture->status_short, Fixture::FINISHED_STATUS_SHORTS, true);
    }
}
