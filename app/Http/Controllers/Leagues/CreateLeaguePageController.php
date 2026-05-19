<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CreateLeaguePageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $currentLeagueCount = $request->user()?->scoreboards()->count() ?? 0;

        return Inertia::render('league-create', [
            'currentLeagueCount' => $currentLeagueCount,
            'maxLeagueCount' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
            'hasReachedLeagueLimit' => $currentLeagueCount >= LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
        ]);
    }
}
