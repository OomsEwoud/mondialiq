<?php

namespace App\Http\Controllers\Predictions;

use App\Enums\PredictionTypes;
use App\Http\Controllers\Controller;
use App\Http\Requests\Predictions\StoreMatchPredictionRequest;
use App\Models\Fixture;
use App\Models\Prediction;
use Illuminate\Http\RedirectResponse;

class StoreMatchPredictionController extends Controller
{
    public function __invoke(StoreMatchPredictionRequest $request, Fixture $fixture): RedirectResponse
    {
        $data = $request->validated();

        Prediction::query()->updateOrCreate(
            [
                'fixture_id' => $fixture->id,
                'user_id' => $request->user()->id,
            ],
            [
                'winner_id' => $this->winnerId($fixture, $data['outcome']),
                'source' => PredictionTypes::User,
                'home_goals' => $data['home_score'] ?? null,
                'away_goals' => $data['away_score'] ?? null,
                'total_goals' => isset($data['home_score'], $data['away_score'])
                    ? $data['home_score'] + $data['away_score']
                    : null,
                'confidence' => $data['confidence'] ?? null,
            ],
        );

        return back()->with('success', 'Prediction saved.');
    }

    private function winnerId(Fixture $fixture, string $outcome): ?int
    {
        return match ($outcome) {
            'home' => $fixture->home_team_id,
            'away' => $fixture->away_team_id,
            default => null,
        };
    }
}
