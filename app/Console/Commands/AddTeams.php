<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Team\TeamService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-teams')]
#[Description('Haal teams op uit de Football API en sla ze op')]
class AddTeams extends Command
{
    public function __construct(
        protected TeamService $teamService,
        protected FootballApiService $serviceApi,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van teams');
        $teams = [];

        $this->components->task('Data uit API ophalen', function () use (&$teams) {
            $teams = $this->serviceApi->getTeams(
                config('services.api_football.league_id'),
                config('services.api_football.season'),
            );
        });

        $this->components->task('Data van teams opslaan in database', function () use ($teams) {
            if (! empty($teams)) {
                $this->teamService->storeTeams($teams);
            }
        });

        $this->info('Teams klaar');

        return self::SUCCESS;
    }
}
