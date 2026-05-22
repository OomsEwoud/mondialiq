<?php

namespace App\Services\Fixture;

use App\Models\Team;
use App\Models\FixtureStat;

class FixtureStatsService
{
    public function storeFixtureStats(array $stats, int $fixtureId): void
    {
        foreach ($stats as $teamStat) {
            $this->storeFixtureStatsPerTeam($teamStat, $fixtureId);
        }
    }

    private function storeFixtureStatsPerTeam(array $stat, int $fixtureId): void
    {
        $localTeamId = Team::query()->where('external_id', data_get($stat, 'team.id'))->value('id');

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
}
