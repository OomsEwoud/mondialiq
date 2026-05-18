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
        $localTeamId = Team::query()->where('external_id', $stat['team']['id'])->value('id');

        if (! $localTeamId) {
            return;
        }

        foreach ($stat['statistics'] as $matchStat) {
            FixtureStat::query()->updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'team_id' => $localTeamId,
                    'name' => $matchStat['type'],
                ],
                [
                    'value' => $matchStat['value'] ? (float) rtrim($matchStat['value'], '%') : 0,
                ],
            );
        }
    }
}
