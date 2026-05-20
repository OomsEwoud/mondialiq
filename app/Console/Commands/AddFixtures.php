<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithFootballApiConfig;
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

    public function __construct(
        protected FootballApiService $api,
        protected FixtureService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $config = $this->footballApiConfig();

        if ($config === null) {
            return self::FAILURE;
        }

        $this->info('Ophalen van fixtures');
        $fixtures = [];

        $this->components->task('Data uit API ophalen', function () use (&$fixtures, $config) {
            $fixtures = $this->api->getFixtures($config['leagueId'], $config['season']);
        });

        $this->components->task('Data van fixtures opslaan in database', function () use ($fixtures) {
            if (! empty($fixtures)) {
                $this->service->storeFixtures($fixtures);
            }
        });

        $this->info('Fixtures klaar');

        return self::SUCCESS;
    }
}
