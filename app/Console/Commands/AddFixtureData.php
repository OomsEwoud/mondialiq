<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithRelevantFixtures;
use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixtureStatsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:add-fixture-data')]
#[Description('Haal lineups, stats en events op voor relevante fixtures')]
class AddFixtureData extends Command
{
    use InteractsWithRelevantFixtures;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureStatsService $statsService,
        private readonly FixtureEventsService $eventsService,
        private readonly FixtureLineupService $lineupService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van fixture data voor relevante fixtures');

        $fixtures = $this->relevantFixturesForDataSync();

        if ($fixtures->isEmpty()) {
            $this->info('Geen relevante fixtures gevonden voor fixture data sync.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");

        $this->withProgressBar($fixtures, function (Fixture $fixture) {
            try {
                $this->syncFixtureData($fixture);
            } catch (Throwable $e) {
                $this->newLine();
                $this->error("Fout bij ophalen fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Fixture data voor relevante fixtures is geupdate');

        return self::SUCCESS;
    }

    private function syncFixtureData(Fixture $fixture): void
    {
        $externalFixtureId = (int) $fixture->external_id;

        $this->lineupService->storeLineups(
            $this->api->getFixtureLineups($externalFixtureId),
            $fixture->id,
        );

        $this->statsService->storeFixtureStats(
            $this->api->getFixtureStats($externalFixtureId),
            $fixture->id,
        );

        $this->eventsService->storeFixtureEvents(
            $this->api->getFixtureEvents($externalFixtureId),
            $fixture->id,
        );

        sleep(1);
    }
}
