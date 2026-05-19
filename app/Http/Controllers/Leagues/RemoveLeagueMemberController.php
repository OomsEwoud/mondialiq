<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Http\Requests\Leagues\RemoveLeagueMemberRequest;
use App\Models\Scoreboard;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class RemoveLeagueMemberController extends Controller
{
    public function __invoke(
        RemoveLeagueMemberRequest $request,
        Scoreboard $scoreboard,
        User $member,
    ): RedirectResponse {
        $this->authorize('manage', $scoreboard);

        $scoreboard->users()->detach($member->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('Member removed from the league.'),
        ]);

        return to_route('leagues.show', $scoreboard);
    }
}
