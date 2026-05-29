<?php

namespace App\Services\Fixture;

use App\Models\FixtureStat;
use App\Models\Team;
use Illuminate\Support\Collection;

class FixtureStatsService
{
    public function storeFixtureStats(array $stats, int $fixtureId): void
    {
        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractTeamIds($stats))
            ->pluck('id', 'external_id');

        foreach ($stats as $teamStat) {
            $this->storeFixtureStatsPerTeam($teamStat, $fixtureId, $teamIds);
        }
    }

    private function storeFixtureStatsPerTeam(array $stat, int $fixtureId, Collection $teamIds): void
    {
        $localTeamId = $teamIds[data_get($stat, 'team.id')] ?? null;

        if (! $localTeamId) {
            return;
        }

        foreach (data_get($stat, 'statistics', []) as $matchStat) {
            $name = data_get($matchStat, 'type');

            if (! is_string($name) || $name === '') {
                continue;
            }

            FixtureStat::query()->updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'team_id' => $localTeamId,
                    'name' => $name,
                ],
                [
                    'value' => $this->normalizeValue(data_get($matchStat, 'value')),
                ],
            );
        }
    }

    private function normalizeValue(mixed $value): float
    {
        if (is_string($value)) {
            $value = rtrim($value, '%');
        }

        return is_numeric($value) ? (float) $value : 0.0;
    }

    private function extractTeamIds(array $stats): Collection
    {
        return collect($stats)
            ->pluck('team.id')
            ->filter(fn (mixed $value): bool => is_numeric($value))
            ->map(fn (mixed $value): int => (int) $value)
            ->unique()
            ->values();
    }
}
