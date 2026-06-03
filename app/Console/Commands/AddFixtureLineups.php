<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureLineupService;
use Carbon\CarbonImmutable;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
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

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>
     */
    private function lineupCandidates(): \Illuminate\Database\Eloquent\Collection
    {
        $now = now('Europe/Brussels');

        return Fixture::query()
            ->whereNotNull('external_id')
            ->notStarted()
            ->with(['homeTeam:id,name,code', 'awayTeam:id,name,code'])
            ->whereBetween('match_date', [
                $now->copy()->subMinutes(15)->format('Y-m-d H:i:s'),
                $now->copy()->addMinutes(90)->format('Y-m-d H:i:s'),
            ])
            ->orderBy('match_date')
            ->get([
                'id',
                'external_id',
                'home_team_id',
                'away_team_id',
                'match_date',
                'has_lineups',
                'lineups_synced_at',
                'lineup_sync_attempts',
            ]);
    }

    private function shouldSkip(Fixture $fixture): bool
    {
        if ($fixture->has_lineups) {
            $this->line("Skipping fixture {$fixture->id}: lineups already synced");

            return true;
        }

        if ($fixture->lineup_sync_attempts >= 12) {
            $this->line("Skipping fixture {$fixture->id}: lineup sync attempt limit reached");

            return true;
        }

        if ($fixture->lineups_synced_at !== null && $fixture->lineups_synced_at->isAfter(now('UTC')->subMinutes(15))) {
            $this->line("Skipping fixture {$fixture->id}: lineups checked recently");

            return true;
        }

        return false;
    }

    private function syncLineups(Fixture $fixture): void
    {
        $kickoffInMinutes = (int) now('Europe/Brussels')->diffInMinutes(
            CarbonImmutable::parse($fixture->kickoffAt()),
            false,
        );

        $this->line(sprintf(
            'Fetching lineups for fixture %d: %s vs %s, kickoff in %d minutes',
            $fixture->id,
            $fixture->homeTeam?->code ?? $fixture->homeTeam?->name ?? 'home',
            $fixture->awayTeam?->code ?? $fixture->awayTeam?->name ?? 'away',
            $kickoffInMinutes,
        ));
        $this->line("Calling endpoint /fixtures/lineups for fixture {$fixture->id}");

        try {
            $lineups = $this->api->getFixtureLineups((int) $fixture->external_id);
            $hasLineups = $this->lineupService->storeLineups($lineups, $fixture->id);

            $fixture->forceFill([
                'has_lineups' => $hasLineups,
                'lineups_synced_at' => now('UTC'),
                'lineup_sync_attempts' => $fixture->lineup_sync_attempts + 1,
            ])->save();

            if (! $hasLineups) {
                $this->line("No lineups available for fixture {$fixture->id}; will retry later");
            }
        } catch (Throwable $exception) {
            $fixture->forceFill([
                'lineups_synced_at' => now('UTC'),
                'lineup_sync_attempts' => $fixture->lineup_sync_attempts + 1,
            ])->save();

            $this->error("Fout bij ophalen lineups voor fixture {$fixture->id}: {$exception->getMessage()}");
        }

        sleep(1);
    }
}
