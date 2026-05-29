<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Standing;
use App\Services\Standing\GroupStandingService;
use App\Support\WorldCup\WorldCupContext;
use Inertia\Inertia;
use Inertia\Response;

class GroupsController extends Controller
{
    public function __construct(
        private readonly GroupStandingService $groupStandingService,
        private readonly WorldCupContext $worldCupContext,
    ) {
    }

    public function __invoke(): Response
    {
        $standings = Standing::query()
            ->with('team:id,name,code,logo_url')
            ->where('league_id', $this->worldCupContext->leagueId())
            ->where('season', $this->worldCupContext->season())
            ->orderBy('group_name')
            ->orderBy('rank')
            ->get();

        return Inertia::render('groups', [
            'groups' => $this->groupStandingService->groupStandings($standings),
        ]);
    }
}
