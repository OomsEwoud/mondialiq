<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Team\TeamService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-teams')]
#[Description('Command description')]
class AddTeams extends Command
{
    protected TeamService $teamService;
    protected FootballApiService $serviceApi;

    public function __construct(TeamService $teamService, FootballApiService $serviceApi)
    {
        parent::__construct();
        $this->teamService = $teamService;
        $this->serviceApi = $serviceApi;
    }

    public function handle()
    {
        $teams = $this->serviceApi->getTeams(config('services.api_football.league_id'), config('services.api_football.season'));
        $this->teamService->storeTeams($teams, config('services.api_football.league_id'));
    }
}
