<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Standing;
use App\Services\Standing\GroupStandingService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Inertia\Inertia;
use Inertia\Response;

class GroupsController extends Controller
{
    private const THIRD_PLACE_GROUP = 'Ranking of third-placed teams';

    public function __construct(
        private readonly GroupStandingService $groupStandingService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(): Response
    {
        return Inertia::render('groups', [
            'groups' => $this->groupStandingService->groupStandings($this->standings()),
            'thirdPlaceRanking' => $this->groupStandingService->thirdPlaceRanking(
                $this->thirdPlaceStandings(),
            ),
        ]);
    }

    private function standings(): EloquentCollection
    {
        return Standing::query()
            ->with('team:id,name,code,logo_url')
            ->where('league_id', $this->worldCupContext->leagueId())
            ->where('season', $this->worldCupContext->season())
            ->whereIn('group_name', $this->worldCupGroupNames())
            ->orderBy('group_name')
            ->orderBy('rank')
            ->get();
    }

    private function thirdPlaceStandings(): EloquentCollection
    {
        return Standing::query()
            ->with('team:id,name,code,logo_url')
            ->where('league_id', $this->worldCupContext->leagueId())
            ->where('season', $this->worldCupContext->season())
            ->where('group_name', self::THIRD_PLACE_GROUP)
            ->orderBy('rank')
            ->get();
    }

    private function worldCupGroupNames(): array
    {
        return collect(range('A', 'L'))
            ->map(fn (string $group): string => "Group {$group}")
            ->all();
    }
}
