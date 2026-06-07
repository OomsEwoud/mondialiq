<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureLineupService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Database\Eloquent\Collection;
use Throwable;

#[Signature('app:add-fixture-lineups')]
#[Description('Haal lineups op voor fixtures dicht bij de aftrap')]
class AddFixtureLineups extends Command
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureLineupService $lineupService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $this->info('Ophalen van lineups voor fixtures dicht bij de aftrap');

        $fixtures = $this->lineupCandidates();

        if ($fixtures->isEmpty()) {
            $this->info('Geen fixtures binnen de lineup window gevonden.');

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} lineup kandidaten gevonden.");

        foreach ($fixtures as $fixture) {
            $this->syncLineups($fixture);
        }

        $this->info('Lineup sync afgerond');

        return self::SUCCESS;
    }

    private function lineupCandidates(): Collection
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->with(['homeTeam:id,name,code', 'awayTeam:id,name,code'])
            ->readyForLineupSync()
            ->orderBy('match_date')
            ->get($this->candidateColumns());
    }

    private function candidateColumns(): array
    {
        return [
            'id',
            'external_id',
            'home_team_id',
            'away_team_id',
            'match_date',
            'status_short',
            'status_long',
            'has_lineups',
            'lineups_synced_at',
            'lineup_sync_attempts',
        ];
    }

    private function syncLineups(Fixture $fixture): void
    {
        try {
            $lineups = $this->api->getFixtureLineups((int) $fixture->external_id);
            $hasLineups = $this->lineupService->storeLineups($lineups, $fixture->id);

            $fixture->update([
                'has_lineups' => $hasLineups,
                'lineups_synced_at' => now('Europe/Brussels'),
                'lineup_sync_attempts' => ($fixture->lineup_sync_attempts ?? 0) + 1,
            ]);

            if (! $hasLineups) {
                $this->line("No lineups available for fixture {$fixture->id}; will retry later");
            }
        } catch (Throwable $exception) {
            $fixture->update([
                'lineups_synced_at' => now('Europe/Brussels'),
                'lineup_sync_attempts' => ($fixture->lineup_sync_attempts ?? 0) + 1,
            ]);

            $this->error("Fout bij ophalen lineups voor fixture {$fixture->id}: {$exception->getMessage()}");
        }

        sleep(1);
    }
}
