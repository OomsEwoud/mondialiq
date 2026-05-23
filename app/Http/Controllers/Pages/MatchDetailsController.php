<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchDetailsResource;
use App\Models\Fixture;
use Inertia\Inertia;
use Inertia\Response;

class MatchDetailsController extends Controller
{
    public function __invoke(Fixture $fixture): Response
    {
        $fixture->load([
            'homeTeam',
            'awayTeam',
            'venue.country',
            'referee',
            'fixtureEvents.team',
            'fixtureEvents.player',
            'fixtureEvents.assist',
            'fixtureStats.team',
            'lineups',
            'fixturePlayers.player',
            'playerFixtureStats',
        ]);

        return Inertia::render('match-details', [
            'match' => MatchDetailsResource::make($fixture)->resolve(),
        ]);
    }
}
