<?php

namespace App\Console\Commands\Concerns;

use App\Models\Fixture;
use Illuminate\Database\Eloquent\Collection;

trait InteractsWithRelevantFixtures
{
    /**
     * @return \Illuminate\Database\Eloquent\Collection<int, \App\Models\Fixture>
     */
    protected function relevantFixturesForDataSync(): Collection
    {
        return Fixture::query()
            ->whereNotNull('external_id')
            ->relevantForDataSync()
            ->orderBy('match_date')
            ->get(['id', 'external_id', 'match_date']);
    }
}
