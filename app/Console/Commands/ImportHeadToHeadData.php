<?php

namespace App\Console\Commands;

use App\Models\Fixture;
use App\Services\HeadToHeadService;
use Exception;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

#[Signature('app:import-head-to-head {--fixture_id=} {--force}')]
#[Description('Importeer head-to-head data voor fixtures')]
class ImportHeadToHeadData extends Command
{
    public function __construct(
        protected HeadToHeadService $headToHeadService,
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $fixtureId = $this->option('fixture_id');
        $force = (bool) $this->option('force');

        if ($fixtureId !== null) {
            return $this->importForSingleFixture((int) $fixtureId, $force);
        }

        return $this->importForRelevantFixtures($force);
    }

    private function importForSingleFixture(int $fixtureId, bool $force): int
    {
        $fixture = Fixture::query()
            ->whereKey($fixtureId)
            ->first(['id', 'home_team_id', 'away_team_id']);

        if (! $fixture) {
            $this->error("Fixture {$fixtureId} niet gevonden.");

            return self::FAILURE;
        }

        return $this->importFixtures(collect([$fixture]), $force);
    }

    private function importForRelevantFixtures(bool $force): int
    {
        $query = Fixture::query()
            ->whereNotNull('external_id')
            ->whereNotNull('home_team_id')
            ->whereNotNull('away_team_id')
            ->orderBy('match_date');

        if (! $force) {
            $query->relevantForDataSync();
        }

        $fixtures = $query->get(['id', 'home_team_id', 'away_team_id']);

        if ($fixtures->isEmpty()) {
            $this->info($force
                ? 'Geen fixtures gevonden voor geforceerde head-to-head import.'
                : 'Geen relevante fixtures gevonden voor head-to-head import.');

            return self::SUCCESS;
        }

        return $this->importFixtures($fixtures, $force);
    }

    /**
     * @param  \Illuminate\Support\Collection<int, \App\Models\Fixture>  $fixtures
     */
    private function importFixtures(Collection $fixtures, bool $force): int
    {
        $seenPairs = [];

        foreach ($fixtures as $fixture) {
            if (! is_numeric($fixture->home_team_id) || ! is_numeric($fixture->away_team_id)) {
                continue;
            }

            $homeTeamId = (int) $fixture->home_team_id;
            $awayTeamId = (int) $fixture->away_team_id;

            $pairKey = $this->headToHeadService->makePairKey($homeTeamId, $awayTeamId);

            if (isset($seenPairs[$pairKey])) {
                continue;
            }

            $seenPairs[$pairKey] = true;

            try {
                if (! $force && $this->headToHeadService->hasFreshData($homeTeamId, $awayTeamId)) {
                    $this->line("Overgeslagen {$pairKey}, data is nog recent genoeg.");

                    continue;
                }

                $headToHead = $this->headToHeadService->importForTeams(
                    $homeTeamId,
                    $awayTeamId,
                    $force,
                );

                $this->line("Geimporteerd {$headToHead->pair_key}");
            } catch (Exception $exception) {
                $this->error("Fout bij importeren van {$pairKey}: {$exception->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
