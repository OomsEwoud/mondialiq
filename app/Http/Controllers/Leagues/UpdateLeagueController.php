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
        $scoreboard->update([
            'name' => $request->validated('name'),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('League updated.'),
        ]);

        return to_route('leagues.show', $scoreboard);
    }
}
