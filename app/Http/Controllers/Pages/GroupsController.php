<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Models\League;
use App\Support\WorldCup\WorldCupContext;
use Illuminate\Http\RedirectResponse;

class GroupsController extends Controller
{
    public function __invoke(WorldCupContext $worldCupContext): RedirectResponse
    {
        $leagueId = $worldCupContext->leagueId();
        $league = $leagueId === null ? null : League::query()->find($leagueId);

        return $league
            ? to_route('competitions.show', ['league' => $league, 'tab' => 'standings'])
            : to_route('competitions.index');
    }
}
