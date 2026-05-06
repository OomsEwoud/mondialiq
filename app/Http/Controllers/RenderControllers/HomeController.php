<?php

namespace App\Http\Controllers\RenderControllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Fixture;
use Carbon\Carbon;
use Inertia\Inertia;

class HomeController extends Controller
{
    public function __invoke()
    {
        $now = Carbon::now();
        $upcomingFixtures = Fixture::where('match_date', '>=', $now)
            ->orderBy('match_date', 'asc')
            ->take(5)
            ->get()
            ->map(function (Fixture $match) {
                return [
                    'id' => $match->id,
                    'homeTeam' => $match->homeTeam->name,
                    'awayTeam' => $match->awayTeam->name,
                    'displayDay' => $match->match_date->format('d M'),
                    'displayTime' => $match->match_date->format('H:i'),
                    'round'       => $match->round_name,
                ];
            });
            
        return Inertia::render('home', [
            'upcomingFixtures' => $upcomingFixtures,
        ]);
    }
}
