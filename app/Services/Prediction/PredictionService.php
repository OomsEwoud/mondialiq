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
            [
                'fixture_id' => $fixtureId,
                'user_id' => null,
                'source' => PredictionTypes::Api->value,
            ],
            [
                'winner_id' => $this->resolveWinnerId(data_get($apiPrediction, 'winner.id')),
                'total_goals' => data_get($apiPrediction, 'under_over'),
                'home_goals' => data_get($apiPrediction, 'goals.home'),
                'away_goals' => data_get($apiPrediction, 'goals.away'),
                'advice' => data_get($apiPrediction, 'advice'),
                'home_chance' => $this->normalizePercentage(data_get($apiPrediction, 'percent.home')),
                'draw_chance' => $this->normalizePercentage(data_get($apiPrediction, 'percent.draw')),
                'away_chance' => $this->normalizePercentage(data_get($apiPrediction, 'percent.away')),
            ],
        );
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
