<?php

namespace App\Http\Controllers\Pages;

use App\Http\Controllers\Controller;
use App\Http\Resources\PlayerDetailsResource;
use App\Models\Player;
use App\Support\WorldCup\WorldCupContext;
use Inertia\Inertia;
use Inertia\Response;

class PlayerDetailsController extends Controller
{
    public function __construct(
        private readonly WorldCupContext $worldCupContext,
    ) {}

    public function __invoke(Player $player): Response
    {
        $player->load([
            'country',
            'activeTeams',
            'playerSeasonStats' => fn ($query) => $query
                ->whereIn('league_id', $this->worldCupContext->leagueIds())
                ->where('season', $this->worldCupContext->season())
                ->with('league'),
        ]);

        return Inertia::render('player-details', [
            'player' => PlayerDetailsResource::make($player)->resolve(),
        ]);
    }
}
