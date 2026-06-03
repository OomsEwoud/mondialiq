<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Prediction;
use App\Models\Team;

class PredictionService
{
    public function storeApiPrediction(array $prediction, int $fixtureId): void
    {
        Prediction::query()->updateOrCreate(
            $this->predictionIdentity($fixtureId),
            $this->predictionAttributes($this->apiPredictionPayload($prediction)),
        );
    }

    private function apiPredictionPayload(array $prediction): array
    {
        $apiPrediction = data_get($prediction, '0.predictions');

        return is_array($apiPrediction) ? $apiPrediction : [];
    }

    private function predictionIdentity(int $fixtureId): array
    {
        return [
            'fixture_id' => $fixtureId,
            'user_id' => null,
            'source' => PredictionTypes::Api->value,
        ];
    }

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

    private function resolveWinnerId(mixed $apiWinnerId): ?int
    {
        if (! is_numeric($apiWinnerId)) {
            return null;
        }

        return Team::query()
            ->where('external_id', (int) $apiWinnerId)
            ->value('id');
    }

    private function normalizePercentage(mixed $percentage): ?float
    {
        if ($percentage === null) {
            return null;
        }

        return (float) rtrim((string) $percentage, '%');
    }
}
