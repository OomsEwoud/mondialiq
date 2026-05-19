<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\LeaveLeagueRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class LeaveLeagueController extends Controller
{
    public function __invoke(LeaveLeagueRequest $request, Scoreboard $scoreboard): RedirectResponse
    {
        $scoreboard->users()->detach($request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('You left :league.', ['league' => $scoreboard->name]),
        ]);

        return to_route('leaderboards');
    }
}
