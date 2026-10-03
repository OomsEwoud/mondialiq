<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use Inertia\Inertia;
use Inertia\Response;

class CompetitionsController extends Controller
{
    public function __invoke(): Response
    {
        $competitions = League::query()
            ->with('country:id,name')
            ->orderBy('name')
            ->get()
            ->map(fn (League $league): array => $this->competitionSummary($league))
            ->values();

        return Inertia::render('competitions/index', [
            'competitions' => $competitions,
        ]);
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
