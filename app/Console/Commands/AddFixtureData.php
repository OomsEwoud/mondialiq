<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithRelevantFixtures;
use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixtureService;
use App\Services\Fixture\FixtureStatsService;
use App\Services\Fixture\LiveFixtureService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-data')]
#[Description('Haal lineups, stats en events op voor relevante fixtures')]
class AddFixtureData extends Command
{
    use InteractsWithRelevantFixtures;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureService $fixtureService,
        private readonly FixtureStatsService $statsService,
        private readonly FixtureEventsService $eventsService,
        private readonly FixtureLineupService $lineupService,
        private readonly LiveFixtureService $liveFixtureService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        return $this->runRelevantFixtureDataSync(
            'Ophalen van fixture data voor relevante fixtures',
            'Geen relevante fixtures gevonden voor fixture data sync.',
            'Fixture data voor relevante fixtures is geupdate',
            'Fout bij ophalen fixture',
            function (Fixture $fixture): void {
                $this->syncFixtureData($fixture);
            },
        );
    }

    private function syncFixtureData(Fixture $fixture): void
    {
        $externalFixtureId = $this->externalFixtureId($fixture);

        $this->line(sprintf(
            'Fixture %d oud [%s | %s | elapsed %s]',
            $fixture->id,
            $fixture->status_short ?? '-',
            $fixture->status_long ?? '-',
            $fixture->elapsed_time ?? '-',
        ));

        $fixturePayload = $this->api->getFixture($externalFixtureId);

        $this->fixtureService->storeFixtures($fixturePayload);

        $fixture->refresh();
        $this->liveFixtureService->forgetCache();

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

        $this->newLine();
        $this->line(sprintf(
            'Fixture %d nieuw [%s | %s | elapsed %s]',
            $fixture->id,
            $fixture->status_short ?? '-',
            $fixture->status_long ?? '-',
            $fixture->elapsed_time ?? '-',
        ));

        sleep(1);
    }
}
