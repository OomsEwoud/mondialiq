<?php

namespace App\Console\Commands\Concerns;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Throwable;

trait InteractsWithRelevantFixtures
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>
     */
    protected function relevantFixturesForDataSync(): Collection
    {
        return $this->dataSyncFixtureQuery()
            ->relevantForDataSync()
            ->get(['id', 'external_id', 'match_date', 'status_short', 'status_long', 'elapsed_time']);
    }

    protected function runRelevantFixtureDataSync(
        string $startMessage,
        string $emptyMessage,
        string $doneMessage,
        string $errorMessage,
        callable $syncFixture,
    ): int {
        $this->info($startMessage);

        $fixtures = $this->relevantFixturesForDataSync();

        if ($fixtures->isEmpty()) {
            $this->info($emptyMessage);

            return self::SUCCESS;
        }

        $this->info("{$fixtures->count()} relevante fixtures gevonden.");
        $this->logRelevantFixtures($fixtures);

        $this->withProgressBar($fixtures, function (Fixture $fixture) use ($syncFixture, $errorMessage): void {
            try {
                $syncFixture($fixture);
            } catch (Throwable $exception) {
                $this->newLine();
                $this->error("{$errorMessage} {$fixture->id}: {$exception->getMessage()}");
            }
        });

        $this->newLine();
        $this->info($doneMessage);

        return self::SUCCESS;
    }

    protected function externalFixtureId(Fixture $fixture): int
    {
        return (int) $fixture->external_id;
    }

    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>
     */
    protected function fixturesForHeadToHeadImport(bool $force): Collection
    {
        $query = $this->dataSyncFixtureQuery()
            ->whereNotNull('home_team_id')
            ->whereNotNull('away_team_id');

        if (! $force) {
            $query->relevantForDataSync();
        }

        return $query->get(['id', 'home_team_id', 'away_team_id']);
    }

    private function dataSyncFixtureQuery(): Builder
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->orderBy('match_date');
    }

    /**
     * @param  \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>  $fixtures
     */
    private function logRelevantFixtures(Collection $fixtures): void
    {
        foreach ($fixtures as $fixture) {
            $this->line(sprintf(
                ' - Fixture %d (external %d) geselecteerd [%s | %s | elapsed %s]',
                $fixture->id,
                (int) $fixture->external_id,
                $fixture->status_short ?? '-',
                $fixture->status_long ?? '-',
                $fixture->elapsed_time ?? '-',
            ));
        }
    }
}
