<?php

namespace App\Http\Controllers\RenderControllers;

use App\Http\Controllers\Controller;
use App\Models\Fixture;
use App\Models\League;
use Inertia\Inertia;

class MatchesController extends Controller
{
    public function __invoke()
    {
        $leagueId = config('services.api_football.league_id');
        $localLeagueId = League::where('external_id', $leagueId)->value('id');

        $fixtures = Fixture::with(['homeTeam', 'awayTeam', 'apiPrediction'])
            ->where('league_id', $localLeagueId)
            ->where('season', config('services.api_football.season'))
            ->orderBy('match_date', 'asc')
            ->paginate(10)
            ->through(function (Fixture $match) {
                $prediction = $match->apiPrediction;

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
                    'round' => $match->round_name,
                    'prediction' => $prediction ? [
                        'homeWin' => $prediction->home_chance,
                        'draw' => $prediction->draw_chance,
                        'awayWin' => $prediction->away_chance,
                    ] : null,
                ];
            });

        return Inertia::render('matches', ['fixtures' => $fixtures]);
    }
}
