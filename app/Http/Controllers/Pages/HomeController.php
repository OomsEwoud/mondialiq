<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\Fixture;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $now = Carbon::now();
        $upcomingFixtures = Fixture::query()
            ->where('match_date', '>=', $now)
            ->orderBy('match_date', 'asc')
            ->take(5)
            ->get()
            ->map(function (Fixture $match) {
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
            });

        return Inertia::render('home', [
            'upcomingFixtures' => $upcomingFixtures,
        ]);
    }
}
