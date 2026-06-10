<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamDetailsResource;
use App\Models\Fixture;
use App\Models\Team;
use App\Support\WorldCup\WorldCupContext;
use Inertia\Inertia;
use Inertia\Response;

class TeamDetailsController extends Controller
{
    public function __construct(
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Team $team): Response
    {
        $this->ensureWorldCupTeam($team);
        $this->loadTeamDetails($team);

        return Inertia::render('team-details', [
            'team' => TeamDetailsResource::make($team)->resolve(),
        ]);
    }

    private function loadTeamDetails(Team $team): void
    {
        $team->load([
            'country',
            'coach.country',
            'activePlayers',
        ]);
    }

    private function ensureWorldCupTeam(Team $team): void
    {
        $participates = Fixture::query()
            ->where(fn ($query) => $query
                ->where('home_team_id', $team->id)
                ->orWhere('away_team_id', $team->id)
            )
            ->whereIn('league_id', $this->worldCupContext->leagueIds())
            ->where('season', $this->worldCupContext->season())
            ->exists();

        abort_if(! $participates, 404);
    }
}
