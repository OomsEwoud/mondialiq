<?php

namespace App\Http\Controllers\Predictions;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EditPredictionPreferencesController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $preference = $request->user()->userPreference();

        return Inertia::render('predictions/preferences', [
            'predictionPreferences' => [
                'predictions_visibility' => $preference->predictions_visibility,
                'default_prediction_visibility' => $preference->default_prediction_visibility,
                'show_on_leaderboards' => $preference->show_on_leaderboards,
                'allow_group_visibility' => $preference->allow_group_visibility,
            ],
        ]);
    }
}
