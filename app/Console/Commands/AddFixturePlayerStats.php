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

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>
     */
    protected function relevantFixturesForDataSync(): \Illuminate\Database\Eloquent\Collection
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->readyForPlayerStatsSync()
            ->orderBy('match_date')
            ->get([
                'id',
                'external_id',
                'match_date',
                'status_short',
                'status_long',
                'elapsed_time',
                'player_stats_synced_at',
                'player_stats_sync_attempts',
            ]);
    }

    private function syncFixturePlayerStats(Fixture $fixture): void
    {
        $this->line("Fetching player stats for fixture {$fixture->id}: status {$fixture->status_short}");
        $this->line("Calling endpoint /fixtures/players for fixture {$fixture->id}");

        $playerStats = $this->api->getFixturePlayersStats($this->externalFixtureId($fixture));

        $this->playerStatsService->storeFixturePlayerStats($playerStats, $fixture->id);

        $fixture->forceFill([
            'player_stats_synced_at' => now('UTC'),
            'player_stats_sync_attempts' => $fixture->player_stats_sync_attempts + 1,
        ])->save();

        sleep(1);
    }
}
