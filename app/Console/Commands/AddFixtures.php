<?php

namespace App\Console\Commands;

use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixtures')]
#[Description('Haal fixtures op uit de Football API en sla ze op')]
class AddFixtures extends Command
{
    public function __construct(
        protected FootballApiService $api,
        protected FixtureService $service,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van fixtures');
        $fixtures = [];

        $this->components->task('Data uit API ophalen', function () use (&$fixtures) {
            $fixtures = $this->api->getFixtures(
                config('services.api_football.league_id'),
                config('services.api_football.season'),
            );
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
