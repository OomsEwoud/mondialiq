<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamDetailsResource;
use App\Models\Team;
use Inertia\Inertia;
use Inertia\Response;

class TeamDetailsController extends Controller
{
    public function __invoke(Team $team): Response
    {
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
}
