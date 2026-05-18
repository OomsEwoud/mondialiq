<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\JoinLeagueRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class JoinLeagueController extends Controller
{
    public function __invoke(JoinLeagueRequest $request): RedirectResponse
    {
        $league = Scoreboard::query()
            ->where('code', $request->validated('code'))
            ->firstOrFail();

        $league->users()->attach($request->user()->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('You joined :league.', ['league' => $league->name]),
        ]);

        return to_route('leagues.show', $league);
    }
}
