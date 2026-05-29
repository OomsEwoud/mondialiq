<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Standing\StandingService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-standings')]
#[Description('Haal standings op uit de Football API en sla ze op')]
class AddStandings extends Command
{
    use InteractsWithFootballApiConfig;
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly StandingService $service,
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
            'Ophalen van standings',
            'Data van standings opslaan in database',
            fn (): array => $this->api->getStandings($config['leagueId'], $config['season']),
            function (array $standings): void {
                $this->service->storeStandings($standings);
            },
            'Standings klaar',
        );
    }
}
