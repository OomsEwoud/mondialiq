<?php

namespace App\Services\Fixture;

use App\Models\Fixture;
use Illuminate\Support\Facades\Cache;

class LiveFixtureService
{
    private const CACHE_KEY = 'live-fixtures';
    private const CACHE_TTL_SECONDS = 30;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function liveFixtures(): array
    {
        return Cache::remember(
            self::CACHE_KEY,
            now()->addSeconds(self::CACHE_TTL_SECONDS),
            fn (): array => $this->freshLiveFixtures(),
        );
    }

    public function forgetCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function freshLiveFixtures(): array
    {
        return Fixture::query()
            ->inProgress()
            ->select([
                'id',
                'home_team_id',
                'away_team_id',
                'match_date',
                'status_short',
                'status_long',
                'elapsed_time',
                'fulltime_home_goals',
                'fulltime_away_goals',
                'updated_at',
            ])
            ->with([
                'homeTeam:id,name,code',
                'awayTeam:id,name,code',
            ])
            ->orderBy('match_date')
            ->get()
            ->map(fn (Fixture $fixture): array => [
                'id' => $fixture->id,
                'home_team' => [
                    'id' => $fixture->homeTeam?->id,
                    'name' => $fixture->homeTeam?->name,
                    'code' => $fixture->homeTeam?->code,
                ],
                'away_team' => [
                    'id' => $fixture->awayTeam?->id,
                    'name' => $fixture->awayTeam?->name,
                    'code' => $fixture->awayTeam?->code,
                ],
                'home_goals' => $fixture->fulltime_home_goals,
                'away_goals' => $fixture->fulltime_away_goals,
                'status_short' => $fixture->status_short,
                'status_long' => $fixture->status_long,
                'elapsed_time' => $fixture->elapsed_time,
                'updated_at' => $fixture->updated_at?->toISOString(),
            ])
            ->all();
    }
}
