<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlayerDetailsResource;
use App\Models\Player;
use Inertia\Inertia;
use Inertia\Response;

class PlayerDetailsController extends Controller
{
    public function __invoke(Player $player): Response
    {
        $player->load([
            'country',
            'activeTeams',
            'playerSeasonStats.league',
        ]);

        return Inertia::render('player-details', [
            'player' => PlayerDetailsResource::make($player)->resolve(),
        ]);
    }
}
