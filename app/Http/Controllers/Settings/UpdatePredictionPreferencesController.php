<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePredictionPreferencesRequest;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class UpdatePredictionPreferencesController extends Controller
{
    public function __invoke(UpdatePredictionPreferencesRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $request->user()->userPreference()->update([
            'predictions_visibility' => $validated['predictions_visibility'],
            'default_prediction_visibility' => $validated['default_prediction_visibility'],
            'show_on_leaderboards' => $validated['show_on_leaderboards'],
            'allow_group_visibility' => $validated['allow_group_visibility'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Prediction preferences saved.')]);

        return to_route('edit-account');
    }
}
