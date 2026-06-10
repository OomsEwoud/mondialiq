<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Fixture;
use App\Models\User;
use App\Services\Fixture\LiveFixtureService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const UPCOMING_FIXTURE_LIMIT = 5;

    public function __construct(
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(
        Request $request,
        LiveFixtureService $liveFixtureService,
    ): Response {
        return Inertia::render('home', [
            'upcomingFixtures' => $this->upcomingFixtures($request->user()),
            'liveFixtures' => $liveFixtureService->liveFixtures(),
        ]);
    }

    private function upcomingFixtures(?User $user): Collection
    {
        return Fixture::query()
            ->with([
                'homeTeam:id,name,code,logo_url',
                'awayTeam:id,name,code,logo_url',
            ])
            ->when($user, fn ($query) => $query->with([
                'userPredictions' => fn ($query) => $query
                    ->whereBelongsTo($user)
                    ->whereNull('scoreboard_id')
                    ->select(['id', 'fixture_id', 'user_id', 'home_goals', 'away_goals']),
            ]))
            ->whereIn('league_id', $this->worldCupContext->leagueIds())
            ->where('season', $this->worldCupContext->season())
            ->upcomingNotStarted()
            ->orderBy('match_date', 'asc')
            ->take(self::UPCOMING_FIXTURE_LIMIT)
            ->get()
            ->map(fn (Fixture $match) => $this->fixtureAttributes($match, $user));
    }

    private function fixtureAttributes(Fixture $match, ?User $user): array
    {
        return [
            'id' => $match->id,
            'homeTeam' => $match->homeTeam->name,
            'homeTeamShort' => $match->homeTeam->code,
            'homeTeamLogo' => $match->homeTeam->logo_url,
            'awayTeam' => $match->awayTeam->name,
            'awayTeamShort' => $match->awayTeam->code,
            'awayTeamLogo' => $match->awayTeam->logo_url,
            'day' => $match->match_date->format('d M'),
            'time' => $match->match_date->format('H:i'),
            'kickoffAt' => $match->kickoffAt(),
            'round' => $match->round_name,
            'statusShort' => $match->status_short,
            'statusLong' => $match->status_long,
            'hasLineups' => $match->has_lineups,
            'predictionState' => $this->predictionState($match, $user),
            'userPrediction' => $this->userPrediction($match, $user),
        ];
    }

    private function userPrediction(Fixture $match, ?User $user): ?array
    {
        if (! $user || $match->userPredictions->isEmpty()) {
            return null;
        }

        $prediction = $match->userPredictions->first();

        return [
            'homeScore' => $prediction->home_goals !== null ? (int) $prediction->home_goals : null,
            'awayScore' => $prediction->away_goals !== null ? (int) $prediction->away_goals : null,
        ];
    }

    private function predictionState(Fixture $match, ?User $user): ?string
    {
        if (! $user) {
            return null;
        }

        return $match->userPredictions->isNotEmpty() ? 'predicted' : 'missing';
    }
}
