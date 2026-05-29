<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Models\Standing;
use App\Services\Standing\GroupStandingService;
use Inertia\Inertia;
use Inertia\Response;

class GroupsController extends Controller
{
    public function __construct(
        private readonly GroupStandingService $groupStandingService,
    ) {
    }

    public function __invoke(): Response
    {
        $leagueId = League::query()
            ->where('external_id', config('services.api_football.league_id'))
            ->value('id');
        $season = config('services.api_football.season');

        $standings = Standing::query()
            ->with('team:id,name,code,logo_url')
            ->where('league_id', $leagueId)
            ->where('season', $season)
            ->orderBy('group_name')
            ->orderBy('rank')
            ->get();

        return Inertia::render('groups', [
            'groups' => $this->groupStandingService->groupStandings($standings),
        ]);
    }
}
