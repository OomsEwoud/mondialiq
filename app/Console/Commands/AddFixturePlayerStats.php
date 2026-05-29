<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithRelevantFixtures;
use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixturePlayerStatsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Throwable;

#[Signature('app:add-fixture-player-stats')]
#[Description('Haal spelerstatistieken op voor relevante fixtures')]
class AddFixturePlayerStats extends Command
{
    use InteractsWithRelevantFixtures;

    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixturePlayerStatsService $playerStatsService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van spelerstatistieken voor relevante fixtures');

        $fixtures = $this->relevantFixturesForDataSync();

        if ($fixtures->isEmpty()) {
            $this->info('Geen relevante fixtures gevonden voor spelerstatistieken sync.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");

        $this->withProgressBar($fixtures, function (Fixture $fixture) {
            try {
                $this->syncFixturePlayerStats($fixture);
            } catch (Throwable $e) {
                $this->newLine();
                $this->error("Fout bij ophalen spelerstatistieken voor fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Spelerstatistieken voor relevante fixtures zijn geupdate');

        return self::SUCCESS;
    }

    private function syncFixturePlayerStats(Fixture $fixture): void
    {
        $playerStats = $this->api->getFixturePlayersStats((int) $fixture->external_id);

        $this->playerStatsService->storeFixturePlayerStats($playerStats, $fixture->id);

        // API-FOOTBALL applies tight per-endpoint rate limits during live syncing.
        sleep(1);
    }
}
