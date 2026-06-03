<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithRelevantFixtures;
use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureService;
use App\Services\Fixture\FixtureStatsService;
use App\Services\Fixture\LiveFixtureService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;

#[Signature('app:add-fixture-data')]
#[Description('Haal basis-, live- en finale data op voor relevante fixtures')]
class AddFixtureData extends Command
{
    use InteractsWithRelevantFixtures;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureService $fixtureService,
        private readonly FixtureStatsService $statsService,
        private readonly FixtureEventsService $eventsService,
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

    protected function relevantFixturesForDataSync(): Collection
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->where(fn ($query) => $query
                ->relevantForDataSync()
                ->orWhere(fn ($query) => $query->readyForFinalDataSync()))
            ->orderBy('match_date')
            ->get([
                'id',
                'external_id',
                'match_date',
                'status_short',
                'status_long',
                'elapsed_time',
                'fixture_basics_synced_at',
                'final_data_synced_at',
                'final_data_sync_attempts',
            ]);
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

        $this->line("Calling endpoint /fixtures for fixture {$fixture->id}");

        $fixturePayload = $this->api->getFixture($externalFixtureId);

        $this->fixtureService->storeFixtures($fixturePayload);

        $fixture->refresh();
        $this->liveFixtureService->forgetCache();

        if ($this->isLive($fixture)) {
            $this->syncLiveEndpoints($fixture, $externalFixtureId);
        } elseif ($this->shouldSyncFinalData($fixture)) {
            $this->syncFinalEndpoints($fixture, $externalFixtureId);
        } else {
            $this->line("Skipping heavy endpoints for fixture {$fixture->id}: {$this->skipReason($fixture)}");
        }

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

    private function syncLiveEndpoints(Fixture $fixture, int $externalFixtureId): void
    {
        $this->line(sprintf(
            "Fetching live data for fixture %d: status %s %s'",
            $fixture->id,
            $fixture->status_short ?? '-',
            $fixture->elapsed_time ?? '-',
        ));

        $this->line("Calling endpoint /fixtures/statistics for fixture {$fixture->id}");
        $this->statsService->storeFixtureStats(
            $this->api->getFixtureStats($externalFixtureId),
            $fixture->id,
        );

        $this->line("Calling endpoint /fixtures/events for fixture {$fixture->id}");
        $this->eventsService->storeFixtureEvents(
            $this->api->getFixtureEvents($externalFixtureId),
            $fixture->id,
        );
    }

    private function syncFinalEndpoints(Fixture $fixture, int $externalFixtureId): void
    {
        $this->line("Fetching final data for fixture {$fixture->id}: status {$fixture->status_short}");

        $this->line("Calling endpoint /fixtures/statistics for fixture {$fixture->id}");
        $this->statsService->storeFixtureStats(
            $this->api->getFixtureStats($externalFixtureId),
            $fixture->id,
        );

        $this->line("Calling endpoint /fixtures/events for fixture {$fixture->id}");
        $this->eventsService->storeFixtureEvents(
            $this->api->getFixtureEvents($externalFixtureId),
            $fixture->id,
        );

        $fixture->forceFill([
            'final_data_synced_at' => now('UTC'),
            'final_data_sync_attempts' => $fixture->final_data_sync_attempts + 1,
        ])->save();
    }

    private function isLive(Fixture $fixture): bool
    {
        return in_array($fixture->status_short, Fixture::LIVE_STATUS_SHORTS, true);
    }

    private function shouldSyncFinalData(Fixture $fixture): bool
    {
        return in_array($fixture->status_short, Fixture::FINISHED_STATUS_SHORTS, true)
            && $fixture->final_data_synced_at === null
            && $fixture->final_data_sync_attempts < 3;
    }

    private function skipReason(Fixture $fixture): string
    {
        if ($fixture->status_short === Fixture::NOT_STARTED_STATUS_SHORT) {
            return 'Not Started; only fixture basics synced';
        }

        if (in_array($fixture->status_short, Fixture::FINISHED_STATUS_SHORTS, true)) {
            return 'final data already synced or attempt limit reached';
        }

        return 'not live or finished';
    }
}
