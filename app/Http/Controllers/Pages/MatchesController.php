<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Services\Helper\HelperService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchesController extends Controller
{
    public function __construct(
        private readonly HelperService $helperService,
        private readonly FixturePaginationService $paginationService,
        private readonly WorldCupContext $worldCupContext,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $filters = $this->parseFilters($request);

        $query = new FixtureQuery(
            $this->worldCupContext->leagueId(),
            $this->worldCupContext->season(),
        );
        $baseQuery = $query->build(
            array_fill_keys(['round', 'date', 'team', 'status'], ''),
        );

        $filterOptions = $this->helperService->filterOptions($baseQuery);

        $queryFilters = $filters;
        $queryFilters['round'] = $this->helperService->roundNameFromSlug(
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
            'date' => $request->date('date')?->format('Y-m-d') ?? '',
            'team' => $request->string('team')->toString(),
            'status' => $request->string('status')->toString() ?: 'all',
        ];
    }

}
