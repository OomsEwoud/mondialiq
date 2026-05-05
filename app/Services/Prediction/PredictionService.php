<?php

namespace App\Services\Prediction;

use App\Enums\PredictionTypes;
use App\Models\Prediction;
use App\Models\Team;
use App\Models\Fixture;

class PredictionService
{
    public function storeApiPrediction(array $prediction, int $fixtureId): void
    {
        $apiWinnerId = $prediction[0]['predictions']['winner']['id'] ?? null;
        $localWinnerId = null;

        if ($apiWinnerId) {
            $localWinnerId = Team::where('external_id', $apiWinnerId)->value('id');
        }

        Prediction::updateOrCreate(
            [
                'fixture_id' => $fixtureId,
                'user_id' => null,
                'source' => PredictionTypes::Api->value,
            ],
            [
                'winner_id' =>  $localWinnerId,
                'total_goals' => $prediction[0]['predictions']['under_over'] ?? null,
                'home_goals' => $prediction[0]['predictions']['goals']['home'] ?? null,
                'away_goals' => $prediction[0]['predictions']['goals']['away'] ?? null,
                'advice' => $prediction[0]['predictions']['advice'] ?? null,
                'home_chance' => isset($prediction[0]['predictions']['percent']['home'])
                    ? (float) rtrim($prediction[0]['predictions']['percent']['home'], '%')
                    : null,
                'draw_chance' => isset($prediction[0]['predictions']['percent']['draw'])
                    ? (float) rtrim($prediction[0]['predictions']['percent']['draw'], '%')
                    : null,
                'away_chance' => isset($prediction[0]['predictions']['percent']['away'])
                    ? (float) rtrim($prediction[0]['predictions']['percent']['away'], '%')
                    : null,
            ]
        );
    }
}
