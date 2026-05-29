<?php

namespace App\Services\Fixture;

use App\Models\FixtureStat;
use App\Models\Team;
use App\Services\Fixture\Concerns\ExtractsApiPayloadIds;
use Illuminate\Support\Collection;

class FixtureStatsService
{
    use ExtractsApiPayloadIds;

    public function storeFixtureStats(array $stats, int $fixtureId): void
    {
        $teamIds = Team::query()
            ->whereIn('external_id', $this->extractNumericIds($stats, 'team.id'))
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
                $this->statIdentity($fixtureId, $localTeamId, $name),
                $this->statAttributes($matchStat),
            );
        }
    }

    /**
     * @return array{fixture_id: int, team_id: int, name: string}
     */
    private function statIdentity(int $fixtureId, int $teamId, string $name): array
    {
        return [
            'fixture_id' => $fixtureId,
            'team_id' => $teamId,
            'name' => $name,
        ];
    }

    /**
     * @return array{value: float}
     */
    private function statAttributes(array $matchStat): array
    {
        return [
            'value' => $this->normalizeValue(data_get($matchStat, 'value')),
        ];
    }

    private function normalizeValue(mixed $value): float
    {
        if (is_string($value)) {
            $value = rtrim($value, '%');
        }

        return is_numeric($value) ? (float) $value : 0.0;
    }
}
