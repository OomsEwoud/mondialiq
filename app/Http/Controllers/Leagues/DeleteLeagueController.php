<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class DeleteLeagueController extends Controller
{
    public function __invoke(Scoreboard $scoreboard): RedirectResponse
    {
        $leagueName = $scoreboard->name;

        $scoreboard->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('League deleted: :league.', ['league' => $leagueName]),
        ]);

        return to_route('leaderboards');
    }
}
