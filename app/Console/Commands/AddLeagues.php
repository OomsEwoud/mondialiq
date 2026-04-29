<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\League\LeagueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-leagues')]
#[Description('Command description')]
class AddLeagues extends Command
{
    protected LeagueService $leagueService;
    protected FootballApiService $serviceFootball;
    public function __construct(LeagueService $leagueService, FootballApiService $serviceFootball)
    {
        parent::__construct();
        $this->leagueService = $leagueService;
        $this->serviceFootball = $serviceFootball;
    }

    public function handle()
    {
        $leagues = $this->serviceFootball->getLeagues();
        $this->leagueService->storeLeagues($leagues);
    }
}
