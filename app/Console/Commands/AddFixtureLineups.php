<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureLineupService;
use Carbon\CarbonImmutable;
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
            if ($this->shouldSkip($fixture)) {
                continue;
            }

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

    private function shouldSkip(Fixture $fixture): bool
    {
        if (! $fixture->shouldSyncLineups()) {
            $this->line("Skipping fixture {$fixture->external_id}: {$fixture->lineupSyncSkipReason()}");

            return true;
        }

        return false;
    }

    private function syncLineups(Fixture $fixture): void
    {
        $this->line(sprintf(
            'Fetching lineups for fixture %d: %s vs %s, kickoff in %d minutes',
            $fixture->id,
            $fixture->homeTeam?->code ?? $fixture->homeTeam?->name ?? 'home',
            $fixture->awayTeam?->code ?? $fixture->awayTeam?->name ?? 'away',
            $this->kickoffInMinutes($fixture),
        ));
        $this->line("Calling endpoint /fixtures/lineups for fixture {$fixture->id}");

        try {
            $lineups = $this->api->getFixtureLineups((int) $fixture->external_id);
            $hasLineups = $this->lineupService->storeLineups($lineups, $fixture->id);

            $fixture->forceFill([
                'has_lineups' => $hasLineups,
                'lineups_synced_at' => now('Europe/Brussels'),
                'lineup_sync_attempts' => $fixture->lineup_sync_attempts + 1,
            ])->save();

            if (! $hasLineups) {
                $this->line("No lineups available for fixture {$fixture->id}; will retry later");
            }
        } catch (Throwable $exception) {
            $fixture->forceFill([
                'lineups_synced_at' => now('Europe/Brussels'),
                'lineup_sync_attempts' => $fixture->lineup_sync_attempts + 1,
            ])->save();

            $this->error("Fout bij ophalen lineups voor fixture {$fixture->id}: {$exception->getMessage()}");
        }

        sleep(1);
    }

    private function kickoffInMinutes(Fixture $fixture): int
    {
        $matchDate = CarbonImmutable::createFromFormat(
            'Y-m-d H:i:s',
            $fixture->match_date->format('Y-m-d H:i:s'),
            'Europe/Brussels',
        );

        if (! $matchDate instanceof CarbonImmutable) {
            return 0;
        }

        return (int) now('Europe/Brussels')->diffInMinutes($matchDate, false);
    }
}
