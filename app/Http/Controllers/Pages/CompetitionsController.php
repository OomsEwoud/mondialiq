<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Pages\CompetitionsIndexRequest;
use App\Models\Country;
use App\Models\League;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionsController extends Controller
{
    public function __invoke(CompetitionsIndexRequest $request): Response
    {
        $search = trim((string) $request->validated('search', ''));
        $internationalCountryIds = Country::query()
            ->whereIn(DB::raw('LOWER(name)'), ['europe', 'international', 'world'])
            ->pluck('id');

        $domesticQuery = League::query()
            ->whereNotNull('country_id')
            ->whereNotIn('country_id', $internationalCountryIds);

        $this->applySearch($domesticQuery, $search);

        $domesticCompetitions = $domesticQuery
            ->with('country:id,name')
            ->orderBy('name')
            ->paginate(10, ['*'], 'domestic_page')
            ->withQueryString()
            ->through(fn (League $league): array => $this->competitionSummary($league));

        $internationalQuery = League::query()
            ->where(function (Builder $query) use ($internationalCountryIds): void {
                $query->whereNull('country_id')
                    ->orWhereIn('country_id', $internationalCountryIds);
            });

        $this->applySearch($internationalQuery, $search);

        $internationalCompetitions = $internationalQuery
            ->with('country:id,name')
            ->orderBy('name')
            ->paginate(10, ['*'], 'international_page')
            ->withQueryString()
            ->through(fn (League $league): array => $this->competitionSummary($league));

        return Inertia::render('competitions/index', [
            'domesticCompetitions' => $domesticCompetitions,
            'internationalCompetitions' => $internationalCompetitions,
            'search' => $search,
        ]);
    }

    private function applySearch(Builder $query, string $search): void
    {
        if ($search === '') {
            return;
        }

        $query->where(function (Builder $query) use ($search): void {
            $query->where('name', 'like', "%{$search}%")
                ->orWhereHas('country', fn (Builder $countryQuery) => $countryQuery
                    ->where('name', 'like', "%{$search}%"));
        });
    }

    private function competitionSummary(League $league): array
    {
        $season = $league->fixtures()->max('season')
            ?? $league->standings()->max('season')
            ?? $league->teamStatistics()->max('season')
            ?? $league->playerSeasonStats()->max('season');
        $teamsCount = $season === null
            ? 0
            : $league->standings()->where('season', $season)->distinct('team_id')->count('team_id');
        if ($teamsCount === 0 && $season !== null) {
            $teamsCount = $league->fixtures()->where('season', $season)
                ->get(['home_team_id', 'away_team_id'])
                ->flatMap(fn ($fixture): array => [$fixture->home_team_id, $fixture->away_team_id])
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
        $upcomingCount = $season === null ? 0 : $league->fixtures()
            ->where('season', $season)
            ->upcomingNotStarted()
            ->count();
        $nextRound = $season === null ? null : $league->fixtures()
            ->where('season', $season)
            ->upcomingNotStarted()
            ->orderBy('match_date')
            ->value('round_name');

        $countryName = $league->country?->name;
        $internationalCountries = ['europe', 'international', 'world'];

        return [
            'id' => $league->id,
            'name' => $league->name,
            'type' => $league->type,
            'logoUrl' => $league->logo_url,
            'country' => $countryName,
            'season' => $season,
            'teamsCount' => $teamsCount ?: null,
            'upcomingMatchesCount' => $upcomingCount ?: null,
            'currentRound' => $nextRound,
            'region' => $countryName === null
                || in_array(mb_strtolower($countryName), $internationalCountries, true)
                ? 'international'
                : 'domestic',
        ];
    }
}
