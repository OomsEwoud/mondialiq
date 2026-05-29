<?php

namespace App\Console\Commands\Concerns;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

trait InteractsWithRelevantFixtures
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>
     */
    protected function relevantFixturesForDataSync(): Collection
    {
        return $this->dataSyncFixtureQuery()
            ->relevantForDataSync()
            ->get(['id', 'external_id', 'match_date']);
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
}
