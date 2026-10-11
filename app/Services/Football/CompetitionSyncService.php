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
        $this->fixtures->storeFixtures($this->api->getFixtures(
            (int) config('services.api_football.league_id'), (int) config('services.api_football.season'),
        ));
    }

    public function standings(): void
    {
        $query = $this->fixturesQuery();
        $active = (clone $query)->whereBetween('match_date', [now('Europe/Brussels')->subDay(), now('Europe/Brussels')->addDay()])->exists();
        $key = 'football:standings:'.config('services.api_football.league_id').':'.config('services.api_football.season').':'.($active ? 'active' : 'idle');
        if (Cache::has($key)) {
            return;
        }

        $data = $this->api->getStandings((int) config('services.api_football.league_id'), (int) config('services.api_football.season'));
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
