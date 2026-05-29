<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
use App\Console\Commands\Concerns\RunsFootballApiImportTasks;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixtures')]
#[Description('Haal fixtures op uit de Football API en sla ze op')]
class AddFixtures extends Command
{
    use InteractsWithFootballApiConfig;
    use RunsFootballApiImportTasks;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureService $service,
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
            'Ophalen van fixtures',
            'Data van fixtures opslaan in database',
            fn (): array => $this->api->getFixtures($config['leagueId'], $config['season']),
            function (array $fixtures): void {
                $this->service->storeFixtures($fixtures);
            },
            'Fixtures klaar',
        );
    }
}
