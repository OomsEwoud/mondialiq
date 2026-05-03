<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:addplayers')]
#[Description('Sync all players and team squads from the Football API')]
class Addplayers extends Command
{
    public function __construct(
        private FootballApiService $api,
        private PlayerService $service,
    ) {
        parent::__construct();
    }

    public function handle(): void
    {
        $players = $this->api->getPlayersByLeagueSeason(config('services.api_football.league_id'), config('services.api_football.season'));
        $this->service->storePlayers($players);

        $teams = Team::all();

        foreach ($teams as $team) {
            $teamPlayerData = $this->api->getPlayers($team->external_id);
            $this->service->storeTeamPlayers($team->id, $teamPlayerData);
        }
    }
}
