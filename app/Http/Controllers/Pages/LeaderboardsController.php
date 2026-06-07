<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Services\League\LeaderboardService;
use App\Support\Leagues\LeagueMembershipLimit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaderboardsController extends Controller
{
    public function __construct(
        private readonly LeaderboardService $leaderboardService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $leaders = $this->leaderboardService->globalLeaders();
        $user = $request->user();

        return Inertia::render('leaderboards', [
            'globalLeaderboard' => $leaders->take(10)->values(),
            'currentUserPosition' => $this->leaderboardService->currentUserPosition($leaders, $user),
            'totalPlayers' => $leaders->count(),
            'joinedLeagues' => $this->leaderboardService->joinedLeagues($user),
            'createLeagueHref' => route('leagues.create'),
            'joinLeagueHref' => route('leagues.join'),
            'scoringGuideHref' => route('scoring'),
            'currentLeagueCount' => $this->leaderboardService->currentLeagueCount($user),
            'maxLeagueCount' => LeagueMembershipLimit::MAX_LEAGUES_PER_USER,
        ]);
    }
}
