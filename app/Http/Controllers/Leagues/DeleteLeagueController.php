<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\DeleteLeagueRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class DeleteLeagueController extends Controller
{
    public function __invoke(DeleteLeagueRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $leagueName = $scoreboard->name;

        $scoreboard->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Prediction group deleted: :group.', ['group' => $leagueName]),
        ]);

        return to_route('leaderboards');
    }
}
