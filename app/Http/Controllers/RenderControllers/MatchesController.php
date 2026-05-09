<?php

namespace App\Http\Controllers\RenderControllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\League;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Helper\HelperService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MatchesController extends Controller
{
    private int $leagueId;
    private int $season;

    public function __construct(private readonly HelperService $service)
    {
        $this->leagueId = League::where(
            'external_id', 
            config('services.api_football.league_id')
        )->value('id');

        $this->season = config('services.api_football.season');
    }

    public function __invoke(Request $request)
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

        $fixtures = $query->build($queryFilters)
            ->paginate(10)
            ->withQueryString()
            ->through(fn ($fixture) => FixtureResource::make($fixture)->resolve());

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
