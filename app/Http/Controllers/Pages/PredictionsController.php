<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Queries\Fixture\FixtureQuery;
use App\Queries\Fixture\PredictionFixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PredictionsController extends Controller
{
    public function __construct(
        private readonly FixturePaginationService $paginationService,
        private readonly PredictionFixtureQuery $predictionFixtureQuery,
    ) {
    }

    public function __invoke(Request $request): Response
    {
        $mode = $this->predictionMode($request);
        $query = new FixtureQuery($this->leagueId(), $this->season());
        $fixtureQuery = $query->build([
            'round' => '',
            'date' => '',
            'team' => '',
        ]);

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

    private function leagueId(): int
    {
        return League::query()
            ->where('external_id', config('services.api_football.league_id'))
            ->value('id');
    }

    private function season(): int
    {
        return config('services.api_football.season');
    }
}
