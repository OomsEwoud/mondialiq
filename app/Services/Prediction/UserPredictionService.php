<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;
use App\Models\ScoreboardPrediction;
use App\Models\User;

class UserPredictionService
{
    public function store(Fixture $fixture, int $userId, array $data): Prediction
    {
        $data['user_id'] = $userId;

        $prediction = Prediction::query()->updateOrCreate(
            $this->predictionIdentity($fixture, $userId),
            $this->predictionAttributes($fixture, $data),
        );

        $this->syncBoost($prediction, $data);

        return $prediction;
    }

    private function syncBoost(Prediction $prediction, array $data): void
    {
        $scoreboardId = $data['scoreboard_id'] ?? null;

        if ($scoreboardId === null) {
            return;
        }

        $isBoosted = (bool) ($data['is_boosted'] ?? false);

        ScoreboardPrediction::updateOrCreate(
            [
                'scoreboard_id' => (int) $scoreboardId,
                'prediction_id' => $prediction->id,
            ],
            [
                'is_boosted' => $isBoosted,
            ],
        );
    }

    private function predictionIdentity(Fixture $fixture, int $userId): array
    {
        return [
            'fixture_id' => $fixture->id,
            'user_id' => $userId,
        ];
    }

    private function predictionAttributes(Fixture $fixture, array $data): array
    {
        $homeScore = $data['home_score'] ?? null;
        $awayScore = $data['away_score'] ?? null;

        return [
            'winner_id' => $this->winnerId($fixture, $data['outcome']),
            'source' => PredictionTypes::User->value,
            'visibility' => $this->defaultVisibility($data),
            'home_goals' => $homeScore,
            'away_goals' => $awayScore,
            'total_goals' => $this->totalGoals($homeScore, $awayScore),
            'confidence' => $data['confidence'] ?? null,
        ];
    }

    private function defaultVisibility(array $data): ?string
    {
        $explicitVisibility = $data['visibility'] ?? null;

        if (in_array($explicitVisibility, ['public', 'private'], true)) {
            return $explicitVisibility;
        }

        $userId = $data['user_id'] ?? null;

        if ($userId === null) {
            return null;
        }

        $user = User::query()->find($userId);

        if ($user === null) {
            return null;
        }

        return $user->userPreference()->default_prediction_visibility;
    }

    private function winnerId(Fixture $fixture, string $outcome): ?int
    {
        return match ($outcome) {
            'home' => $fixture->home_team_id,
            'away' => $fixture->away_team_id,
            default => null,
        };
    }

    private function totalGoals(?int $homeScore, ?int $awayScore): ?int
    {
        if ($homeScore === null || $awayScore === null) {
            return null;
        }

        return $homeScore + $awayScore;
    }
}
