<?php

namespace App\Http\Controllers\RenderControllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchDetailsResource;
use App\Models\Fixture;
use Inertia\Inertia;

class MatchDetailsController extends Controller
{
    public function __invoke(Fixture $fixture)
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
        ]);

        return Inertia::render('match-details', [
            'match' => MatchDetailsResource::make($fixture)->resolve(),
        ]);
    }
}
