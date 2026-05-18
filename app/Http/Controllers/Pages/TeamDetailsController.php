<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\TeamDetailsResource;
use App\Models\Team;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class TeamDetailsController extends Controller
{
    public function __invoke(Team $team): Response
    {
        $team->load([
            'country',
            'coach.country',
            'players' => fn (Builder $query) => $query
                ->wherePivot('is_active', true)
                ->with('country')
                ->orderBy('position')
                ->orderBy('number')
                ->orderBy('display_name'),
        ]);

        return Inertia::render('team-details', [
            'team' => TeamDetailsResource::make($team)->resolve(),
        ]);
    }
}
