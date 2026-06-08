<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Scoreboard;
use App\Services\Fixture\FixturePaginationService;
use App\Services\League\LeagueShowService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeaguePredictController extends Controller
{
    public function __construct(
        private readonly LeagueShowService $leagueShowService,
        private readonly FixturePaginationService $fixturePaginationService,
    ) {}

    public function __invoke(Request $request, Scoreboard $scoreboard): Response
    {
        $this->authorize('view', $scoreboard);

        $user = $request->user();
        $members = $this->leagueShowService->members($scoreboard, $user);
        $fixtures = $this->fixturePaginationService->paginate(
            $this->leagueShowService->upcomingFixturesQuery($user),
        );

        return Inertia::render('league-predict', [
            'league' => $this->leagueShowService->leagueAttributes($scoreboard, $user, $members),
            'fixtures' => $fixtures,
        ]);
    }
}
