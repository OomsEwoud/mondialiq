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
        $this->info('Ophalen van standings');
        $standings = [];

        $this->components->task('Data uit API ophalen', function () use (&$standings) {
            $standings = $this->api->getStandings(
                config('services.api_football.league_id'),
                config('services.api_football.season')
            );
        });

        $this->components->task('Data van standings opslaan in database', function () use ($standings) {
            if (!empty($standings)) {
                $this->service->storeStandings($standings);
            }
        });
        
        $this->info('Standings klaar');
    }
}
