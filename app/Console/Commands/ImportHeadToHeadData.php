<?php

namespace App\Console\Commands;

use App\Console\Commands\Concerns\InteractsWithRelevantFixtures;
use App\Models\Fixture;
use App\Services\HeadToHeadService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Throwable;

#[Signature('app:import-head-to-head {--fixture_id=} {--force}')]
#[Description('Importeer head-to-head data voor fixtures')]
class ImportHeadToHeadData extends Command
{
    use InteractsWithRelevantFixtures;

    public function __construct(
        private readonly HeadToHeadService $headToHeadService,
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
        $fixtures = $this->fixturesForHeadToHeadImport($force);

        if ($fixtures->isEmpty()) {
            $this->info($force
                ? 'Geen fixtures gevonden voor geforceerde head-to-head import.'
                : 'Geen relevante fixtures gevonden voor head-to-head import.');

            return self::SUCCESS;
        }

        return $this->importFixtures($fixtures, $force);
    }

    /**
     * @param Collection<int, Fixture>  $fixtures
     */
    private function importFixtures(Collection $fixtures, bool $force): int
    {
        $seenPairs = [];

        foreach ($fixtures as $fixture) {
            $fixturePair = $this->fixturePair($fixture);

            if ($fixturePair === null) {
                continue;
            }

            if (isset($seenPairs[$fixturePair['pair_key']])) {
                continue;
            }

            $seenPairs[$fixturePair['pair_key']] = true;
            $this->importFixturePair($fixturePair, $force);
        }

        return self::SUCCESS;
    }

    /**
     * @return array{home_team_id: int, away_team_id: int, pair_key: string}|null
     */
    private function fixturePair(Fixture $fixture): ?array
    {
        if (! is_numeric($fixture->home_team_id) || ! is_numeric($fixture->away_team_id)) {
            return null;
        }

        $homeTeamId = (int) $fixture->home_team_id;
        $awayTeamId = (int) $fixture->away_team_id;

        return [
            'home_team_id' => $homeTeamId,
            'away_team_id' => $awayTeamId,
            'pair_key' => $this->headToHeadService->makePairKey($homeTeamId, $awayTeamId),
        ];
    }

    /**
     * @param  array{home_team_id: int, away_team_id: int, pair_key: string}  $fixturePair
     */
    private function importFixturePair(array $fixturePair, bool $force): void
    {
        try {
            if ($this->shouldSkipFreshPair($fixturePair, $force)) {
                $this->line("Overgeslagen {$fixturePair['pair_key']}, data is nog recent genoeg.");

                return;
            }

            $headToHead = $this->headToHeadService->importForTeams(
                $fixturePair['home_team_id'],
                $fixturePair['away_team_id'],
                $force,
            );

            $this->line("Geimporteerd {$headToHead->pair_key}");
        } catch (Throwable $exception) {
            $this->error("Fout bij importeren van {$fixturePair['pair_key']}: {$exception->getMessage()}");
        }
    }

    /**
     * @param  array{home_team_id: int, away_team_id: int, pair_key: string}  $fixturePair
     */
    private function shouldSkipFreshPair(array $fixturePair, bool $force): bool
    {
        return ! $force && $this->headToHeadService->hasFreshData(
            $fixturePair['home_team_id'],
            $fixturePair['away_team_id'],
        );
    }
}
