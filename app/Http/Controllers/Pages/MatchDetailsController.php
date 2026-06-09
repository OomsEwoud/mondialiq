<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\MatchDetailsResource;
use App\Models\Fixture;
use App\Models\User;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchDetailsController extends Controller
{
    public function __construct(
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Fixture $fixture, Request $request): Response
    {
        $this->ensureWorldCupFixture($fixture);
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

    private function ensureWorldCupFixture(Fixture $fixture): void
    {
        $isWorldCup = in_array($fixture->league_id, $this->worldCupContext->leagueIds(), true)
            && $fixture->season === $this->worldCupContext->season();

        abort_if(! $isWorldCup, 404);
    }
}
