<?php

namespace App\Http\Controllers\Leagues;

use App\Actions\League\JoinLeagueAction;
use App\Exceptions\League\CannotJoinLeagueException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\JoinLeagueRequest;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class JoinLeagueController extends Controller
{
    public function __invoke(JoinLeagueRequest $request, JoinLeagueAction $action): RedirectResponse
    {
        $league = Scoreboard::query()
            ->where('code', $request->validated('code'))
            ->firstOrFail();

        try {
            $action->execute($league, $request->user());
        } catch (CannotJoinLeagueException $e) {
            throw ValidationException::withMessages([
                'code' => $e->getMessage(),
            ]);
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('You joined :group.', ['group' => $league->name]),
        ]);

        return to_route('leagues.show', $league);
    }
}
