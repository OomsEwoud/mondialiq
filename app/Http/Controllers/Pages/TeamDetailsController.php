<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamDetailsResource;
use App\Models\Team;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
            'players' => fn (BelongsToMany $query) => $this->activePlayersQuery($query),
        ]);
    }

    private function activePlayersQuery(BelongsToMany $query): BelongsToMany
    {
        return $query
            ->wherePivot('is_active', true)
            ->with('country')
            ->orderBy('position')
            ->orderBy('number')
            ->orderBy('display_name');
    }
}
