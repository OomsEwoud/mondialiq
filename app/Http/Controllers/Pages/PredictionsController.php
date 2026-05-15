<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PredictionsController extends Controller
{
    protected int $leagueId;
    protected int $season;

    public function __construct(protected FixturePaginationService $paginationService)
    {
        $this->leagueId = League::where(
            'external_id',
            config('services.api_football.league_id')
        )->value('id');

        $this->season = config('services.api_football.season');
    }

    public function __invoke(Request $request)
    {
        $mode = $this->predictionMode($request);
        $query = new FixtureQuery($this->leagueId, $this->season);
        $fixtureQuery = $query->build([
            'round' => '',
            'date' => '',
            'team' => '',
        ]);

        if ($mode === 'mine') {
            $fixtureQuery->whereHas('apiPrediction');
        }

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
