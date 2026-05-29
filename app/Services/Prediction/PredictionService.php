<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Prediction;
use App\Models\Team;

class PredictionService
{
    public function storeApiPrediction(array $prediction, int $fixtureId): void
    {
        $apiPrediction = data_get($prediction, '0.predictions', []);

        Prediction::query()->updateOrCreate(
            $this->predictionIdentity($fixtureId),
            $this->predictionAttributes($apiPrediction),
        );
    }

    /**
     * @return array{fixture_id: int, user_id: null, source: string}
     */
    private function predictionIdentity(int $fixtureId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'user_id' => null,
            'source' => PredictionTypes::Api->value,
        ];
    }

    /**
     * @return array{winner_id: int|null, total_goals: mixed, home_goals: mixed, away_goals: mixed, advice: mixed, home_chance: float|null, draw_chance: float|null, away_chance: float|null}
     */
    private function predictionAttributes(array $apiPrediction): array
    {
        return [
            'winner_id' => $this->resolveWinnerId(data_get($apiPrediction, 'winner.id')),
            'total_goals' => data_get($apiPrediction, 'under_over'),
            'home_goals' => data_get($apiPrediction, 'goals.home'),
            'away_goals' => data_get($apiPrediction, 'goals.away'),
            'advice' => data_get($apiPrediction, 'advice'),
            'home_chance' => $this->normalizePercentage(data_get($apiPrediction, 'percent.home')),
            'draw_chance' => $this->normalizePercentage(data_get($apiPrediction, 'percent.draw')),
            'away_chance' => $this->normalizePercentage(data_get($apiPrediction, 'percent.away')),
        ];
    }

    private function resolveWinnerId(?int $apiWinnerId): ?int
    {
        if ($apiWinnerId === null) {
            return null;
        }

        return Team::query()
            ->where('external_id', $apiWinnerId)
            ->value('id');
    }

    private function normalizePercentage(null|string $percentage): ?float
    {
        if ($percentage === null) {
            return null;
        }

        return (float) rtrim($percentage, '%');
    }
}
