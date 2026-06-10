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

class UserPredictionsController extends Controller
{
    public function __construct(
        private readonly FixturePaginationService $paginationService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Request $request, User $user): Response
    {
        $viewer = $request->user();

        if ($viewer?->id !== $user->id) {
            abort_unless($user->allowsPublicPredictionViewing(), 403);
        }

        $status = $this->statusFilter($request);
        $date = $this->dateFilter($request);
        $pointsState = $this->pointsStateFilter($request);
        $fixtureQuery = $this->fixtureQuery($status, $date);
        $this->applyUserPredictions($fixtureQuery, $user, $viewer, $pointsState);

        $fixtures = $this->paginationService->paginate($fixtureQuery);

        return Inertia::render('user-predictions', [
            'user' => $this->userProps($user, $viewer),
            'fixtures' => $fixtures,
            'filters' => [
                'date' => $date,
                'status' => $status,
                'pointsState' => $pointsState,
            ],
            'scoringGuideHref' => route('scoring'),
        ]);
    }

    private function userProps(User $user, ?User $viewer): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'isViewer' => $viewer?->id === $user->id,
            'predictionsCount' => $user->predictions()->where('source', 'user')->whereNull('scoreboard_id')->count(),
            'totalPoints' => $user->predictions()->where('source', 'user')->whereNull('scoreboard_id')->whereNotNull('points_awarded_at')->sum('points') ?? 0,
        ];
    }

    private function applyUserPredictions(Builder $query, User $user, ?User $viewer, string $pointsState): void
    {
        $query->whereHas('predictions', function (Builder $query) use ($user, $viewer) {
            $query->where('user_id', $user->id)
                ->where('source', 'user')
                ->whereNull('scoreboard_id')
                ->visibleFor($viewer);
        });

        $query->with([
            'homeTeam',
            'awayTeam',
            'apiPrediction',
            'userPredictions' => function ($query) use ($user, $viewer) {
                $query->where('user_id', $user->id)
                    ->where('source', 'user')
                    ->whereNull('scoreboard_id')
                    ->visibleFor($viewer)
                    ->with('winner');
            },
        ]);

        if ($pointsState !== 'all') {
            $query->whereHas('predictions', function (Builder $query) use ($user, $viewer, $pointsState) {
                $query->where('user_id', $user->id)
                    ->where('source', 'user')
                    ->whereNull('scoreboard_id')
                    ->visibleFor($viewer)
                    ->when($pointsState === 'points-pending', fn (Builder $q) => $q->pointsPending())
                    ->when($pointsState === 'points-earned', fn (Builder $q) => $q->pointsEarned())
                    ->when($pointsState === 'no-points-earned', fn (Builder $q) => $q->noPointsEarned());
            });
        }
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
