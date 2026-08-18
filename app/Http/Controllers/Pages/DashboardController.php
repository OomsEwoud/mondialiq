<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\League;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\LiveFixtureService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const UPCOMING_LIMIT = 6;

    private const RECENT_LIMIT = 4;

    public function __construct(
        private readonly LiveFixtureService $liveFixtureService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Request $request): Response
    {
        $leagueIds = League::query()
            ->whereHas('fixtures', fn (Builder $query) => $query
                ->where('season', $this->worldCupContext->season()))
            ->pluck('id')
            ->all();

        $upcomingFixtures = $this->fixtureQuery('upcoming', $leagueIds)
            ->with(['league:id,name,logo_url', 'aiPrediction.winner'])
            ->limit(self::UPCOMING_LIMIT)
            ->get();

        $recentFixtures = $this->fixtureQuery('played', $leagueIds)
            ->with(['league:id,name,logo_url', 'aiPrediction.winner'])
            ->reorder('match_date', 'desc')
            ->limit(self::RECENT_LIMIT)
            ->get();

        return Inertia::render('dashboard', [
            'upcomingFixtures' => FixtureResource::collection($upcomingFixtures)->resolve($request),
            'liveFixtures' => $this->liveFixtureService->liveFixtures(),
            'recentFixtures' => FixtureResource::collection($recentFixtures)->resolve($request),
            'competitions' => League::query()
                ->whereIn('id', $leagueIds)
                ->orderBy('name')
                ->get(['id', 'name', 'logo_url'])
                ->map(fn ($league): array => [
                    'id' => $league->id,
                    'name' => $league->name,
                    'logoUrl' => $league->logo_url,
                ])
                ->all(),
        ]);
    }

    private function fixtureQuery(string $status, array $leagueIds): Builder
    {
        return (new FixtureQuery(
            $leagueIds,
            $this->worldCupContext->season(),
        ))->build(['status' => $status]);
    }
}
