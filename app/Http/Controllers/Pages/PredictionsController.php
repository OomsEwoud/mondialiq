<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Queries\Fixture\FixtureQuery;
use App\Queries\Fixture\PredictionFixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PredictionsController extends Controller
{
    public function __construct(
        private readonly FixturePaginationService $paginationService,
        private readonly PredictionFixtureQuery $predictionFixtureQuery,
        private readonly WorldCupContext $worldCupContext,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $mode = $this->predictionMode($request);
        $status = $this->statusFilter($request);
        $pointsState = $this->pointsStateFilter($request);
        $fixtureQuery = $this->fixtureQuery($status);

        $this->predictionFixtureQuery->applyMode(
            $fixtureQuery,
            $mode,
            $request->user(),
            [
                'pointsState' => $pointsState,
            ],
        );

        $fixtures = $this->paginationService->paginate($fixtureQuery);

        return Inertia::render('predictions', [
            'fixtures' => $fixtures,
            'filters' => [
                'status' => $status,
                'pointsState' => $pointsState,
            ],
            'mode' => $mode,
            'scoringGuideHref' => route('scoring'),
        ]);
    }

    private function predictionMode(Request $request): string
    {
        return $request->string('mode')->toString() === 'mine'
            ? 'mine'
            : 'ai';
    }

    private function statusFilter(Request $request): string
    {
        $status = $request->string('status')->toString();

        return in_array($status, ['upcoming', 'past'], true)
            ? $status
            : 'all';
    }

    private function pointsStateFilter(Request $request): string
    {
        $pointsState = $request->string('pointsState')->toString();

        return in_array($pointsState, [
            'points-pending',
            'points-earned',
            'no-points-earned',
        ], true)
            ? $pointsState
            : 'all';
    }

    private function fixtureQuery(string $status): Builder
    {
        return (new FixtureQuery(
            $this->worldCupContext->leagueId(),
            $this->worldCupContext->season(),
        ))->build([
            'status' => $status,
        ]);
    }
}
