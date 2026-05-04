<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Standing\StandingService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-standings')]
#[Description('Command description')]
class AddStandings extends Command
{
    public function __construct(protected FootballApiService $api, protected StandingService $service)
    {
        parent::__construct();
    }

    
    public function handle()
    {
        $standings = $this->api->getStandings(config('services.api_football.league_id'), config('services.api_football.season'));
        $this->service->storeStandings($standings);
    }
}
