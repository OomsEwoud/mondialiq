<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiPredictionsController extends Controller
{
    public function __construct(
        private readonly FixturePaginationService $paginationService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Request $request): Response
    {
        $aiUser = User::aiUser();

        if ($aiUser === null) {
            abort(404);
        }

        $status = $this->statusFilter($request);
        $date = $this->dateFilter($request);
        $pointsState = $this->pointsStateFilter($request);
        $fixtureQuery = $this->fixtureQuery($status, $date);
        $this->applyAiPredictions($fixtureQuery, $pointsState);

        $fixtures = $this->paginationService->paginate($fixtureQuery);

        return Inertia::render('ai-predictions', [
            'aiUser' => [
                'id' => $aiUser->id,
                'name' => $aiUser->name,
                'avatar' => $aiUser->avatarUrl(),
            ],
            'fixtures' => $fixtures,
            'filters' => [
                'date' => $date,
                'status' => $status,
                'pointsState' => $pointsState,
            ],
            'scoringGuideHref' => route('scoring'),
        ]);
    }

    private function applyAiPredictions(Builder $query, string $pointsState): void
    {
        $query->whereHas('aiPrediction', function (Builder $query) use ($pointsState) {
            if ($pointsState !== 'all') {
                match ($pointsState) {
                    'points-pending' => $query->pointsPending(),
                    'points-earned' => $query->pointsEarned(),
                    'no-points-earned' => $query->noPointsEarned(),
                    default => null,
                };
            }
        });

        $query->with([
            'homeTeam',
            'awayTeam',
            'apiPrediction',
            'aiPrediction',
        ]);
    }

    private function statusFilter(Request $request): string
    {
        $status = $request->string('status')->toString();

        return in_array($status, ['upcoming', 'past', 'live'], true)
            ? $status
            : 'all';
    }

    private function dateFilter(Request $request): string
    {
        return $request->date('date')?->format('Y-m-d') ?? '';
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

    private function fixtureQuery(string $status, string $date): Builder
    {
        return (new FixtureQuery(
            $this->worldCupContext->leagueIds(),
            $this->worldCupContext->season(),
        ))->onlyWorldCupDemoEligible()->build([
            'date' => $date,
            'status' => $status,
        ]);
    }
}
