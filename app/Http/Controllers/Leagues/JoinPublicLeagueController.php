<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class JoinPublicLeagueController extends Controller
{
    public function __invoke(Request $request, Scoreboard $scoreboard): RedirectResponse
    {
        $user = $request->user();

        if ($scoreboard->visibility !== 'public' || !$scoreboard->is_active) {
            abort(403, 'This prediction group is not open for public joining.');
        }

        if ($scoreboard->users()->where('user_id', $user->id)->exists()) {
            Inertia::flash('toast', [
                'type' => 'info',
                'message' => __('You are already a member of :group.', ['group' => $scoreboard->name]),
            ]);
            return to_route('leagues.show', $scoreboard);
        }

        $currentLeagueCount = $user->scoreboards()->count();
        if ($currentLeagueCount >= LeagueMembershipLimit::MAX_LEAGUES_PER_USER) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('You can only join up to :max prediction groups.', ['max' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER]),
            ]);
            return back();
        }

        $scoreboard->users()->attach($user->id, [
            'role' => 'member',
            'joined_at' => now(),
        ]);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('You joined :group.', ['group' => $scoreboard->name]),
        ]);

        return to_route('leagues.show', $scoreboard);
    }
}
