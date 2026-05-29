<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Team\TeamService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-teams')]
#[Description('Haal teams op uit de Football API en sla ze op')]
class AddTeams extends Command
{
    use InteractsWithFootballApiConfig;
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly TeamService $teamService,
        private readonly FootballApiService $api,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        return $this->runFootballApiImport(
            'Ophalen van teams',
            'Data van teams opslaan in database',
            fn (): array => $this->api->getTeams($config['leagueId'], $config['season']),
            function (array $teams): void {
                $this->teamService->storeTeams($teams);
            },
            'Teams klaar',
        );
    }
}
