<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\League\LeagueService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-leagues')]
#[Description('Haal leagues op uit de Football API en sla ze op')]
class AddLeagues extends Command
{
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly LeagueService $leagueService,
        private readonly FootballApiService $api,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        return $this->runFootballApiImport(
            'Ophalen van leagues',
            'Data van leagues opslaan in database',
            fn (): array => $this->api->getLeagues(),
            function (array $leagues): void {
                $this->leagueService->storeLeagues($leagues);
            },
            'Leagues klaar',
        );
    }
}
