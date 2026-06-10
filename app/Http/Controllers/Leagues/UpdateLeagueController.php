<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\UpdateLeagueRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class UpdateLeagueController extends Controller
{
    public function __invoke(UpdateLeagueRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $scoreboard->update($request->safe()->only([
            'name',
            'description',
            'reward_title',
            'reward_description',
            'visibility',
            'is_active',
            'icon',
            'accent_color',
        ]));

        $scoringRules = $request->validatedScoringRules();

        if ($scoringRules !== null) {
            $scoreboard->update(['scoring_rules' => $scoringRules]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Prediction group updated.'),
        ]);

        return to_route('leagues.settings', $scoreboard);
    }
}
