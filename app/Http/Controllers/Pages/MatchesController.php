<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Services\Helper\HelperService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchesController extends Controller
{
    protected int $leagueId;
    protected int $season;

    public function __construct(
        protected HelperService $service,
        protected FixturePaginationService $paginationService,
    ) {
        $this->leagueId = League::where(
            'external_id',
            config('services.api_football.league_id')
        )->value('id');

        $this->season = config('services.api_football.season');
    }

    public function __invoke(Request $request): Response
    {
        $filters = $this->parseFilters($request);

        $query = new FixtureQuery($this->leagueId, $this->season);
        $baseQuery = $query->build(array_fill_keys(['round', 'date', 'team'], ''));

        $filterOptions = $this->service->filterOptions($baseQuery);

        $queryFilters = $filters;
        $queryFilters['round'] = $this->service->roundNameFromSlug(
            $filterOptions['rounds']->all(),
            $filters['round'],
        );

        $fixturesQuery = $query->build($queryFilters)->with('aiPrediction');

        if ($user = $request->user()) {
            $fixturesQuery->with([
                'userPredictions' => fn ($query) => $query
                    ->whereBelongsTo($user)
                    ->with('winner'),
            ]);
        }

        $fixtures = $this->paginationService->paginate($fixturesQuery);

        return Inertia::render('matches', [
            'fixtures'      => $fixtures,
            'filterOptions' => $filterOptions,
            'filters'       => $filters,
        ]);
    }

    private function parseFilters(Request $request): array
    {
        return [
            'round' => $request->string('round')->toString(),
            'date'  => $request->date('date')?->format('Y-m-d') ?? '',
            'team'  => $request->string('team')->toString(),
        ];
    }
}
