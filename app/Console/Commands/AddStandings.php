<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
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

        $this->info('Ophalen van standings');
        $standings = [];

        $this->components->task('Data uit API ophalen', function () use (&$standings, $config) {
            $standings = $this->api->getStandings($config['leagueId'], $config['season']);
        });

        $this->components->task('Data van standings opslaan in database', function () use ($standings) {
            if (! empty($standings)) {
                $this->service->storeStandings($standings);
            }
        });

        $this->info('Standings klaar');

        return self::SUCCESS;
    }
}
