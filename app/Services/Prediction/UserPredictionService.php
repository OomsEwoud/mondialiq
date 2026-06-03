<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Fixture;
use App\Models\Prediction;

class UserPredictionService
{
    public function store(Fixture $fixture, int $userId, array $data): Prediction
    {
        return Prediction::query()->updateOrCreate(
            $this->predictionIdentity($fixture, $userId),
            $this->predictionAttributes($fixture, $data),
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
            'home_goals' => $homeScore,
            'away_goals' => $awayScore,
            'total_goals' => $this->totalGoals($homeScore, $awayScore),
            'confidence' => $data['confidence'] ?? null,
        ];
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
