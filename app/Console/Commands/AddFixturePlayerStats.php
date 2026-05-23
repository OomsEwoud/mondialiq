<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixturePlayerStatsService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('app:add-fixture-player-stats')]
#[Description('Haal spelerstatistieken op voor relevante fixtures')]
class AddFixturePlayerStats extends Command
{
    public function __construct(
        protected FootballApiService $api,
        protected FixturePlayerStatsService $playerStatsService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van spelerstatistieken voor relevante fixtures');

        $fixtures = Fixture::all();

        if ($fixtures->isEmpty()) {
            $this->info('Geen relevante fixtures gevonden voor spelerstatistieken sync.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");

        $this->withProgressBar($fixtures, function (Fixture $fixture) {
            try {
                $playerStats = $this->api->getFixturePlayersStats($fixture->external_id);
                $this->playerStatsService->storeFixturePlayerStats($playerStats, $fixture->id);

                // API-FOOTBALL applies tight per-endpoint rate limits during live syncing.
                sleep(1);
            } catch (Exception $e) {
                $this->newLine();
                $this->error("Fout bij ophalen spelerstatistieken voor fixture {$fixture->id}: {$e->getMessage()}");
            }
        });

        $this->newLine();
        $this->info('Spelerstatistieken voor relevante fixtures zijn geupdate');

        return self::SUCCESS;
    }
}
