<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureEventsService;
use App\Services\Fixture\FixtureLineupService;
use App\Services\Fixture\FixturePlayerStatsService;
use App\Services\Fixture\FixtureStatsService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-data')]
#[Description('Haal lineups, stats en events op voor relevante fixtures')]
class AddFixtureData extends Command
{
    public function __construct(
        protected FootballApiService $api,
        protected FixtureStatsService $statsService,
        protected FixtureEventsService $eventsService,
        protected FixtureLineupService $lineupService,
        protected FixturePlayerStatsService $playerStatsService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van fixture data voor relevante fixtures');

        $fixtures = Fixture::query()
            ->whereNotNull('external_id')
            ->relevantForDataSync()
            ->orderBy('match_date')
            ->get(['id', 'external_id', 'match_date']);

        if ($fixtures->isEmpty()) {
            $this->info('Geen relevante fixtures gevonden voor fixture data sync.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");

        $this->withProgressBar($fixtures, function (Fixture $fixture) {
            try {
                $lineups = $this->api->getFixtureLineups($fixture->external_id);
                $this->lineupService->storeLineups($lineups, $fixture->id);

                $stats = $this->api->getFixtureStats($fixture->external_id);
                $this->statsService->storeFixtureStats($stats, $fixture->id);

                $events = $this->api->getFixtureEvents($fixture->external_id);
                $this->eventsService->storeFixtureEvents($events, $fixture->id);

                $playerStats = $this->api->getFixturePlayersStats($fixture->external_id);
                $this->playerStatsService->storeFixturePlayerStats($playerStats, $fixture->id);

                // API-FOOTBALL applies tight per-endpoint rate limits during live syncing.
                sleep(1);
            } catch (Exception $e) {
                $this->newLine();
                $this->error("Fout bij ophalen fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Fixture data voor relevante fixtures is geupdate');

        return self::SUCCESS;
    }
}
