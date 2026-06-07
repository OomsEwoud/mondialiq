<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Services\Helper\HelperService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchesController extends Controller
{
    private const DEFAULT_STATUS_FILTER = 'all';

    public function __construct(
        private readonly HelperService $helperService,
        private readonly FixturePaginationService $paginationService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Request $request): Response
    {
        $filters = $this->parseFilters($request);
        $baseQuery = $this->fixtureQuery()->build();
        $filterOptions = $this->helperService->filterOptions($baseQuery);
        $fixturesQuery = $this->fixturesQuery($filters, $filterOptions);

        $this->loadPredictionRelations($fixturesQuery, $request->user());

        return Inertia::render('matches', [
            'fixtures' => $this->paginationService->paginate($fixturesQuery),
            'filterOptions' => $filterOptions,
            'filters' => $filters,
        ]);
    }

    private function fixturesQuery(array $filters, array $filterOptions): Builder
    {
        return $this->fixtureQuery()
            ->build($this->queryFilters($filters, $filterOptions));
    }

    private function queryFilters(array $filters, array $filterOptions): array
    {
        return [
            ...$filters,
            'round' => $this->helperService->roundNameFromSlug(
                $filterOptions['rounds']->all(),
                $filters['round'],
            ),
        ];
    }

    private function loadPredictionRelations(Builder $fixturesQuery, ?User $user): void
    {
        $fixturesQuery->with('aiPrediction');

        if ($user) {
            $fixturesQuery->with([
                'userPredictions' => fn ($query) => $query
                    ->whereBelongsTo($user)
                    ->with('winner'),
            ]);
        }
    }

    private function parseFilters(Request $request): array
    {
        return [
            'round' => $request->string('round')->toString(),
            'date' => $request->date('date')?->format('Y-m-d') ?? '',
            'team' => $request->string('team')->toString(),
            'status' => $request->string('status')->toString() ?: self::DEFAULT_STATUS_FILTER,
        ];
    }

    private function fixtureQuery(): FixtureQuery
    {
        return new FixtureQuery(
            $this->worldCupContext->leagueId(),
            $this->worldCupContext->season(),
        );
    }
}
