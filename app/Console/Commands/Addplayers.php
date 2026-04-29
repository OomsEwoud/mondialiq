<?php

namespace App\Console\Commands;

use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:addplayers')]
#[Description('Command description')]
class Addplayers extends Command
{
    protected FootballApiService $api;
    protected PlayerService $service;

    public function __construct(FootballApiService $api, PlayerService $service)
    {
        parent::__construct();
        $this->api = $api;
        $this->service = $service;
    }
    public function handle()
    {
        $teams = Team::all();

        foreach($teams as $team){
            $players = $this->api->getPlayers($team->external_id);

            $this->service->storePlayers($players);

            sleep(10);
        }
    }
}
