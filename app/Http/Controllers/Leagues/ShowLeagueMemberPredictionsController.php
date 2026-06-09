<?php

namespace App\Http\Controllers\Leagues;

use App\Http\Controllers\Controller;
use App\Models\Prediction;
use App\Models\Scoreboard;
use App\Models\User;
use App\Queries\Fixture\FixtureQuery;
use App\Services\Fixture\FixturePaginationService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShowLeagueMemberPredictionsController extends Controller
{
    public function __construct(
        private readonly FixturePaginationService $paginationService,
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Request $request, Scoreboard $scoreboard, User $user): Response
    {
        $this->authorize('view', $scoreboard);

        $viewer = $request->user();

        abort_unless($this->isMember($scoreboard, $viewer), 403);
        abort_unless($this->isMember($scoreboard, $user), 403);

        $status = $this->statusFilter($request);
        $date = $this->dateFilter($request);
        $pointsState = $this->pointsStateFilter($request);
        $fixtureQuery = $this->fixtureQuery($status, $date);
        $this->applyLeagueMemberPredictions($fixtureQuery, $scoreboard, $user, $viewer, $pointsState);

        $fixtures = $this->paginationService->paginate($fixtureQuery);

        return Inertia::render('league-member-predictions', [
            'league' => $this->leagueProps($scoreboard),
            'member' => $this->memberProps($user, $scoreboard, $viewer),
            'fixtures' => $fixtures,
            'filters' => [
                'date' => $date,
                'status' => $status,
                'pointsState' => $pointsState,
            ],
            'scoringGuideHref' => route('scoring'),
        ]);
    }

    private function applyLeagueMemberPredictions(
        Builder $query,
        Scoreboard $scoreboard,
        User $user,
        User $viewer,
        string $pointsState,
    ): void {
        $memberIds = $scoreboard->users()->pluck('users.id');
        $canViewPrivate = $viewer->id === $user->id || $user->allowsGroupPredictionViewing();

        $query->whereHas('predictions', function (Builder $query) use ($user, $scoreboard, $canViewPrivate) {
            $query->where('user_id', $user->id)
                ->where('source', 'user')
                ->when(! $canViewPrivate, fn (Builder $q) => $q->where('visibility', 'public'));
        });

        $query->with([
            'homeTeam',
            'awayTeam',
            'apiPrediction',
            'userPredictions' => function ($query) use ($user, $canViewPrivate, $scoreboard) {
                $query->where('user_id', $user->id)
                    ->where('source', 'user')
                    ->when(! $canViewPrivate, fn (Builder $q) => $q->where('visibility', 'public'))
                    ->with(['winner', 'scoreboardPredictions' => fn ($q) => $q->where('scoreboard_id', $scoreboard->id)]);
            },
        ]);

        if ($pointsState !== 'all') {
            $query->whereHas('predictions', function (Builder $query) use ($user, $pointsState, $canViewPrivate) {
                $query->where('user_id', $user->id)
                    ->where('source', 'user')
                    ->when(! $canViewPrivate, fn (Builder $q) => $q->where('visibility', 'public'))
                    ->when($pointsState === 'points-pending', fn (Builder $q) => $q->pointsPending())
                    ->when($pointsState === 'points-earned', fn (Builder $q) => $q->pointsEarned())
                    ->when($pointsState === 'no-points-earned', fn (Builder $q) => $q->noPointsEarned());
            });
        }
    }

    private function isMember(Scoreboard $scoreboard, User $user): bool
    {
        return $scoreboard->users()->whereKey($user->id)->exists();
    }

    private function leagueProps(Scoreboard $scoreboard): array
    {
        return [
            'id' => $scoreboard->id,
            'name' => $scoreboard->name,
            'showHref' => route('leagues.show', $scoreboard),
            'accentColor' => $scoreboard->accent_color ?? 'cyan',
            'coverStyle' => $scoreboard->cover_style ?? 'stadium',
            'icon' => $scoreboard->icon ?? '🏆',
        ];
    }

    private function memberProps(User $user, Scoreboard $scoreboard, User $viewer): array
    {
        $canViewPrivate = $viewer->id === $user->id || $user->allowsGroupPredictionViewing();

        return [
            'id' => $user->id,
            'name' => $user->name,
            'avatar' => $user->avatarUrl(),
            'isViewer' => $viewer->id === $user->id,
            'predictionsCount' => $user->predictions()
                ->where('source', 'user')
                ->whereHas('scoreboardPredictions', fn ($q) => $q->where('scoreboard_id', $scoreboard->id))
                ->when(! $canViewPrivate, fn ($q) => $q->where('visibility', 'public'))
                ->count(),
            'totalPoints' => $user->predictions()
                ->where('source', 'user')
                ->whereHas('scoreboardPredictions', fn ($q) => $q->where('scoreboard_id', $scoreboard->id)->whereNotNull('points_awarded_at'))
                ->when(! $canViewPrivate, fn ($q) => $q->where('visibility', 'public'))
                ->sum('points') ?? 0,
        ];
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
        ))->build([
            'date' => $date,
            'status' => $status,
        ]);
    }
}
