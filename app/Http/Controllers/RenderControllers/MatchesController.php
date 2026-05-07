<?php

namespace App\Http\Controllers\RenderControllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use App\Models\Fixture;
use App\Models\League;

class MatchesController extends Controller
{
    public function __invoke()
    {
        $leagueId = config('services.api_football.league_id');
        $localLeagueId = League::where('external_id', $leagueId)->first()->id;
        $fixtures = Fixture::where('league_id', $localLeagueId)
            ->where('season', config('services.api_football.season'))
            ->orderBy('match_date', 'asc')
            ->paginate(10)
            ->through(function (Fixture $match) {
                return [
                    'id' => $match->id,
                    'homeTeam' => $match->homeTeam->name,
                    'homeTeamShort' => $match->homeTeam->code,
                    'homeTeamLogo' => $match->homeTeam->logo_url,
                    'awayTeam' => $match->awayTeam->name,
                    'awayTeamShort' => $match->awayTeam->code,
                    'awayTeamLogo' => $match->awayTeam->logo_url,
                    'date' => $match->match_date->format('d M'),
                    'time' => $match->match_date->format('H:i'),
                    'round'       => $match->round_name,
                    'prediction' => [
                        'homeWin' => $match->prediction->home_chance ?? null,
                        'draw'    => $match->prediction->draw_chance ?? null,
                        'awayWin' => $match->prediction->away_chance ?? null
                    ]
                ];
            });

        return Inertia::render('matches', ['fixtures' => $fixtures]);
    }
}
