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
    public function __construct(protected TeamService $teamService, protected FootballApiService $serviceApi)
    {
        parent::__construct();
    }

    public function handle(): void
    {
        $teams = $this->serviceApi->getTeams(config('services.api_football.league_id'), config('services.api_football.season'));
        $this->teamService->storeTeams($teams);
    }
}
