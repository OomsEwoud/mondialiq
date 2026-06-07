<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Services\League\LeagueShowService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueController extends Controller
{
    public function __construct(
        private readonly LeagueShowService $leagueShowService,
    ) {}

    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('view', $scoreboard);

        $user = $request->user();
        $members = $this->leagueShowService->members($scoreboard, $user);

        return Inertia::render('league-show', [
            'league' => $this->leagueShowService->leagueAttributes($scoreboard, $user, $members),
        ]);
    }
}
