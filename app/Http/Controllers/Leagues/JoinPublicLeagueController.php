<?php

namespace App\Http\Controllers\Leagues;

use App\Actions\League\JoinLeagueAction;
use App\Exceptions\League\CannotJoinLeagueException;
use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JoinPublicLeagueController extends Controller
{
    public function __invoke(
        Request $request,
        Scoreboard $scoreboard,
        JoinLeagueAction $action
    ): RedirectResponse {
        $user = $request->user();

        if ($scoreboard->visibility !== 'public') {
            abort(403, 'This prediction group is not open for public joining.');
        }

        try {
            $action->execute($scoreboard, $user);
        } catch (CannotJoinLeagueException $e) {
            $isAlreadyMember = str_contains($e->getMessage(), 'already a member');

            Inertia::flash('toast', [
                'type' => $isAlreadyMember ? 'info' : 'error',
                'message' => $e->getMessage(),
            ]);

            return $isAlreadyMember ? to_route('leagues.show', $scoreboard) : back();
        }

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('You joined :group.', ['group' => $scoreboard->name]),
        ]);

        return to_route('leagues.show', $scoreboard);
    }
}
