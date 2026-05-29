<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Queries\Fixture\FixtureQuery;
use App\Queries\Fixture\PredictionFixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Support\WorldCup\WorldCupContext;
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
        $query = new FixtureQuery(
            $this->worldCupContext->leagueId(),
            $this->worldCupContext->season(),
        );
        $fixtureQuery = $query->build();

        $this->predictionFixtureQuery->applyMode(
            $fixtureQuery,
            $mode,
            $request->user(),
        );

        $fixtures = $this->paginationService->paginate($fixtureQuery);

        return Inertia::render('predictions', [
            'fixtures' => $fixtures,
            'mode' => $mode,
        ]);
    }

    private function predictionMode(Request $request): string
    {
        return $request->string('mode')->toString() === 'mine'
            ? 'mine'
            : 'ai';
    }
}
