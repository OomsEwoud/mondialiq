<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class JoinLeaguePageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $currentLeagueCount = $user?->scoreboards()->count() ?? 0;

        $publicLeagues = \App\Models\Scoreboard::query()
            ->where('visibility', 'public')
            ->where('is_active', true)
            ->when($user, function ($query, $user) {
                $query->whereDoesntHave('users', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                });
            })
            ->withCount('users')
            ->orderByDesc('users_count')
            ->limit(20)
            ->get(['id', 'name', 'description', 'icon', 'accent_color']);

        return Inertia::render('league-join', [
            'initialCode' => Str::upper(Str::substr((string) $request->query('code', ''), 0, 8)),
            'currentLeagueCount' => $currentLeagueCount,
            'maxLeagueCount' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
            'hasReachedLeagueLimit' => $currentLeagueCount >= LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
            'publicLeagues' => $publicLeagues,
        ]);
    }
}
