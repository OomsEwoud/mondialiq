<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\League\LeagueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-leagues')]
#[Description('Haal leagues op uit de Football API en sla ze op')]
class AddLeagues extends Command
{
    public function __construct(
        protected LeagueService $leagueService,
        protected FootballApiService $serviceFootball,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van leagues');
        $leagues = [];

        $this->components->task('Data uit API ophalen', function () use (&$leagues) {
            $leagues = $this->serviceFootball->getLeagues();
        });

        $this->components->task('Data van leagues opslaan in database', function () use ($leagues) {
            if (! empty($leagues)) {
                $this->leagueService->storeLeagues($leagues);
            }
        });

        $this->info('Leagues klaar');

        return self::SUCCESS;
    }
}
