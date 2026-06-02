<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithRelevantFixtures;
use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixturePlayerStatsService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

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
        return $this->runRelevantFixtureDataSync(
            'Ophalen van spelerstatistieken voor relevante fixtures',
            'Geen relevante fixtures gevonden voor spelerstatistieken sync.',
            'Spelerstatistieken voor relevante fixtures zijn geupdate',
            'Fout bij ophalen spelerstatistieken voor fixture',
            function (Fixture $fixture): void {
                $this->syncFixturePlayerStats($fixture);
            },
        );
    }

    private function syncFixturePlayerStats(Fixture $fixture): void
    {
        $playerStats = $this->api->getFixturePlayersStats($this->externalFixtureId($fixture));

        $this->playerStatsService->storeFixturePlayerStats($playerStats, $fixture->id);
        
        sleep(1);
    }
}
