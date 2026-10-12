<?php

namespace App\Services\Football;

use App\Models\Fixture;
use App\Services\Apis\FootballApiService;
use App\Services\Fixture\FixtureService;
use App\Services\Standing\StandingService;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Cache;

class CompetitionSyncService
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly FixtureService $fixtures,
        private readonly StandingService $standings,
    ) {}

    public function fixtures(): void
    {
        foreach (CompetitionConfig::configured() as $competition) {
            $lock = Cache::lock('football:calendar:'.$competition->key(), 120);
            if (! $lock->get()) {
                continue;
            }
            try {
                $key = 'football:calendar-imported:'.$competition->key();
                $initial = ! Cache::has($key);
                $data = $initial
                    ? $this->api->getFixtures($competition->leagueId, $competition->season)
                    : $this->api->getFixturesInWindow($competition->leagueId, $competition->season, now('Europe/Brussels')->subDays(3)->toDateString(), now('Europe/Brussels')->addDays(14)->toDateString());
                $stored = $this->fixtures->storeFixtures($data);
                if ($initial && $data !== [] && ($stored['imported'] > 0 || $competition->constrain(Fixture::query())->exists())) {
                    Cache::put($key, true, now()->addDays(30));
                }
            } finally {
                $lock->release();
            }
        }
    }

    public function standings(): void
    {
        foreach (CompetitionConfig::configured() as $competition) {
            $this->syncStandings($competition);
        }
    }

    private function syncStandings(CompetitionConfig $competition): void
    {
        $query = $competition->constrain(Fixture::query());
        $active = (clone $query)->whereBetween('match_date', [now('Europe/Brussels')->subDay(), now('Europe/Brussels')->addDay()])->exists();
        $key = 'football:standings:'.$competition->key().':'.($active ? 'active' : 'idle');
        if (Cache::has($key)) {
            return;
        }

        $data = $this->api->getStandings($competition->leagueId, $competition->season);
        if ($data !== []) {
            $this->standings->storeStandings($data);
        }
        Cache::put($key, true, $active ? 3600 : 86400);
    }

    public function fixturesQuery(): Builder
    {
        return Fixture::query()->forConfiguredCompetition();
    }
}
