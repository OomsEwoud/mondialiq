<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixtureStatsService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-data')]
#[Description('Haal lineups, stats en events op voor alle fixtures')]
class AddFixtureData extends Command
{
    public function __construct(
        protected FootballApiService $api,
        protected FixtureStatsService $statsService,
        protected FixtureEventsService $eventsService,
        protected FixtureLineupService $lineupService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $fixtures = Fixture::query()->get();
        $this->info('Ophalen van fixture data');

        $this->withProgressBar($fixtures, function (Fixture $fixture) {
            try {
                $lineups = $this->api->getFixtureLineups($fixture->external_id);
                $this->lineupService->storeLineups($lineups, $fixture->id);

                $stats = $this->api->getFixtureStats($fixture->external_id);
                $this->statsService->storeFixtureStats($stats, $fixture->id);

                $events = $this->api->getFixtureEvents($fixture->external_id);
                $this->eventsService->storeFixtureEvents($events, $fixture->id);
                sleep(1);
            } catch (Exception $e) {
                $this->newLine();
                $this->error("Fout bij ophalen fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Alle fixture data is geupdate');

        return self::SUCCESS;
    }
}
