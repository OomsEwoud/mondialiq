<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchDetailsResource;
use App\Models\Fixture;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchDetailsController extends Controller
{
    public function __invoke(Fixture $fixture, Request $request): Response
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
            'missingPlayers.country',
            'missingPlayers.teams',
        ]);
        $this->loadPredictionRelations($fixture, $request->user());

        return Inertia::render('match-details', [
            'match' => MatchDetailsResource::make($fixture)->resolve(),
        ]);
    }

    private function loadPredictionRelations(Fixture $fixture, ?User $user): void
    {
        $fixture->load('aiPrediction');

        if ($user) {
            $fixture->load([
                'userPredictions' => fn ($query) => $query
                    ->whereBelongsTo($user)
                    ->with('winner'),
            ]);
        }
    }
}
