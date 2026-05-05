<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;
use App\Services\Player\PlayerStatsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-players')]
#[Description('Sync all players and team squads from the Football API')]
class Addplayers extends Command
{
    public function __construct(protected FootballApiService $api, protected PlayerService $service, protected PlayerStatsService $statsService)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $this->info('Ophalen van players');
        $players = [];

        $this->components->task('Data uit API ophalen', function () use (&$players) {
            $players = $this->api->getPlayersByLeagueSeason(
                config('services.api_football.league_id'),
                config('services.api_football.season')
            );
        });

        $this->components->task('Data van players opslaan in database', function () use ($players) {
            if (!empty($players)) {
                $this->service->storePlayers($players);
                $this->service->syncTeamPlayers();
                $this->statsService->storePlayerStats($players);
            }
        });

        $this->info('Players klaar');
    }
}
