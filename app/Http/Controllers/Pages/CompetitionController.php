<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\FixtureResource;
use App\Models\Fixture;
use App\Models\League;
use App\Models\PlayerSeasonStat;
use App\Models\Standing;
use App\Models\Team;
use App\Models\TeamStatistic;
use App\Services\Fixture\FixturePaginationService;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionController extends Controller
{
    private const TABS = ['overview', 'matches', 'standings', 'statistics', 'teams'];

    public function __invoke(
        Request $request,
        League $league,
        FixturePaginationService $paginationService,
        WorldCupContext $worldCupContext,
    ): Response {
        $isWorldCup = $league->id === $worldCupContext->leagueId();
        $season = $isWorldCup ? $worldCupContext->season() : $this->season($league);
        $tab = $request->string('tab')->toString();
        $tab = in_array($tab, self::TABS, true) ? $tab : 'overview';

        return Inertia::render('competitions/show', [
            'competition' => $this->competition($league, $season),
            'tab' => $tab,
            'standings' => $this->standings($league, $season, $isWorldCup),
            'isWorldCup' => $isWorldCup,
            'fixtures' => $this->fixtures($league, $season, $tab, $paginationService),
            'teams' => $this->teams($league, $season),
            'teamStatistics' => $this->teamStatistics($league, $season),
            'topScorers' => $this->topScorers($league, $season),
        ]);
    }

    private function season(League $league): ?int
    {
        return $league->fixtures()->max('season')
            ?? $league->standings()->max('season')
            ?? $league->teamStatistics()->max('season')
            ?? $league->playerSeasonStats()->max('season');
    }

    private function competition(League $league, ?int $season): array
    {
        $league->loadMissing('country:id,name');
        $teamsCount = $season === null
            ? 0
            : $league->standings()->where('season', $season)->distinct('team_id')->count('team_id');
        if ($teamsCount === 0 && $season !== null) {
            $teamsCount = $league->fixtures()->where('season', $season)
                ->get(['home_team_id', 'away_team_id'])
                ->flatMap(fn (Fixture $fixture): array => [$fixture->home_team_id, $fixture->away_team_id])
                ->unique()
                ->count();
        }
        if ($teamsCount === 0 && $season !== null) {
            $teamsCount = $league->teamStatistics()
                ->where('season', $season)
                ->whereNotNull('team_id')
                ->distinct('team_id')
                ->count('team_id');
        }
        $currentRound = $season === null ? null : $league->fixtures()
            ->where('season', $season)
            ->upcomingNotStarted()
            ->orderBy('match_date')
            ->value('round_name');

        return [
            'id' => $league->id,
            'name' => $league->name,
            'type' => $league->type,
            'logoUrl' => $league->logo_url,
            'country' => $league->country?->name,
            'season' => $season,
            'teamsCount' => $teamsCount ?: null,
            'currentRound' => $currentRound,
        ];
    }

    private function standings(League $league, ?int $season, bool $isWorldCup): array
    {
        if ($season === null) {
            return [];
        }

        return Standing::query()
            ->with('team:id,name,code,logo_url')
            ->select([
                'team_id',
                'group_name',
                'rank',
                'points',
                'matches_played',
                'wins',
                'draws',
                'losses',
                'goals_for',
                'goals_against',
                'goal_difference',
                'form',
            ])
            ->whereBelongsTo($league)
            ->where('season', $season)
            ->orderBy('group_name')
            ->orderBy('rank')
            ->get()
            ->groupBy('group_name')
            ->map(fn ($rows, string $group): array => [
                'name' => $group,
                'advanceCount' => $isWorldCup
                    ? ($group === 'Ranking of third-placed teams' ? 8 : 2)
                    : null,
                'teams' => $rows->map(fn (Standing $standing): array => [
                    'id' => $standing->team->id,
                    'name' => $standing->team->name,
                    'code' => $standing->team->code,
                    'logoUrl' => $standing->team->logo_url,
                    'rank' => $standing->rank,
                    'played' => $standing->matches_played,
                    'wins' => $standing->wins,
                    'draws' => $standing->draws,
                    'losses' => $standing->losses,
                    'goalsFor' => $standing->goals_for,
                    'goalsAgainst' => $standing->goals_against,
                    'goalDifference' => $standing->goal_difference,
                    'points' => $standing->points,
                    'form' => $standing->form,
                ])->all(),
            ])->values()->all();
    }

    private function fixtures(
        League $league,
        ?int $season,
        string $tab,
        FixturePaginationService $paginationService,
    ): array {
        if ($season === null) {
            return [
                'upcoming' => [],
                'recent' => [],
                'all' => ['data' => [], 'links' => []],
            ];
        }

        $query = Fixture::query()
            ->whereBelongsTo($league)
            ->where('season', $season)
            ->with(['homeTeam:id,name,code,logo_url', 'awayTeam:id,name,code,logo_url', 'aiPrediction']);

        $upcoming = (clone $query)->upcomingNotStarted()->orderBy('match_date')->limit(6)->get();
        $recent = (clone $query)->finished()
            ->orderByDesc('match_date')->limit(6)->get();
        $all = $tab === 'matches'
            ? $paginationService->paginate((clone $query)->orderBy('match_date'), 20)
            : ['data' => [], 'links' => []];

        return [
            'upcoming' => FixtureResource::collection($upcoming)->resolve(),
            'recent' => FixtureResource::collection($recent)->resolve(),
            'all' => $all,
        ];
    }

    private function teams(League $league, ?int $season): array
    {
        if ($season === null) {
            return [];
        }

        $standingTeamIds = $league->standings()->where('season', $season)->pluck('team_id');
        $fixtureTeamIds = $league->fixtures()->where('season', $season)
            ->get(['home_team_id', 'away_team_id'])
            ->flatMap(fn (Fixture $fixture): array => [$fixture->home_team_id, $fixture->away_team_id]);
        $statisticTeamIds = $league->teamStatistics()
            ->where('season', $season)
            ->whereNotNull('team_id')
            ->pluck('team_id');
        $teamIds = $standingTeamIds->merge($fixtureTeamIds)->merge($statisticTeamIds)->unique()->filter();

        return Team::query()
            ->whereIn('id', $teamIds)
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'logo_url'])
            ->map(fn ($team): array => [
                'id' => $team->id,
                'name' => $team->name,
                'code' => $team->code,
                'logoUrl' => $team->logo_url,
            ])->all();
    }

    private function teamStatistics(League $league, ?int $season): array
    {
        if ($season === null) {
            return [];
        }

        return TeamStatistic::query()
            ->with('team:id,name,code,logo_url')
            ->select([
                'team_id',
                'form',
                'fixtures_played_total',
                'wins_total',
                'goals_for_total',
                'goals_against_total',
                'clean_sheets_total',
                'goals_for_avg_home',
                'goals_for_avg_away',
            ])
            ->whereBelongsTo($league)
            ->where('season', $season)
            ->whereNotNull('team_id')
            ->orderByDesc('wins_total')
            ->get()
            ->map(fn (TeamStatistic $statistic): array => [
                'teamId' => $statistic->team_id,
                'teamName' => $statistic->team?->name,
                'teamLogoUrl' => $statistic->team?->logo_url,
                'form' => $statistic->form,
                'played' => $statistic->fixtures_played_total,
                'wins' => $statistic->wins_total,
                'goalsFor' => $statistic->goals_for_total,
                'goalsAgainst' => $statistic->goals_against_total,
                'cleanSheets' => $statistic->clean_sheets_total,
                'goalsForHome' => $statistic->goals_for_avg_home,
                'goalsForAway' => $statistic->goals_for_avg_away,
            ])->all();
    }

    private function topScorers(League $league, ?int $season): array
    {
        if ($season === null) {
            return [];
        }

        return PlayerSeasonStat::query()
            ->with('player:id,display_name,photo_url')
            ->select([
                'player_id',
                'total_goals',
                'total_assists',
                'appearances',
            ])
            ->whereBelongsTo($league)
            ->where('season', $season)
            ->where('total_goals', '>', 0)
            ->orderByDesc('total_goals')
            ->orderByDesc('total_assists')
            ->limit(10)
            ->get()
            ->map(fn (PlayerSeasonStat $statistic): array => [
                'id' => $statistic->player->id,
                'name' => $statistic->player->display_name,
                'photoUrl' => $statistic->player->photo_url,
                'goals' => $statistic->total_goals,
                'assists' => $statistic->total_assists,
                'appearances' => $statistic->appearances,
            ])->all();
    }
}
