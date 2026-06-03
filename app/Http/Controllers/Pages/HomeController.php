<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Fixture;
use App\Services\Fixture\LiveFixtureService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    private const UPCOMING_FIXTURE_LIMIT = 5;

    public function __invoke(LiveFixtureService $liveFixtureService): Response
    {
        return Inertia::render('home', [
            'upcomingFixtures' => $this->upcomingFixtures(),
            'liveFixtures' => $liveFixtureService->liveFixtures(),
        ]);
    }

    private function upcomingFixtures(): Collection
    {
        return Fixture::query()
            ->with(['homeTeam:id,name,code,logo_url', 'awayTeam:id,name,code,logo_url'])
            ->where('match_date', '>=', Carbon::now())
            ->orderBy('match_date', 'asc')
            ->take(self::UPCOMING_FIXTURE_LIMIT)
            ->get()
            ->map(fn (Fixture $match) => $this->fixtureAttributes($match));
    }

    private function fixtureAttributes(Fixture $match): array
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
            'round' => $match->round_name,
        ];
    }
}
