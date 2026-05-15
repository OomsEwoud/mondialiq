<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
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

    public function __invoke()
    {
        $query = new FixtureQuery($this->leagueId, $this->season);

        $fixtures = $this->paginationService->paginate(
            $query->build([
                'round' => '',
                'date' => '',
                'team' => '',
            ])
        );

        return Inertia::render('predictions', [
            'fixtures' => $fixtures,
        ]);
    }
}
