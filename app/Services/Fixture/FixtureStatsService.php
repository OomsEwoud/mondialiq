<?php

namespace App\Services\Fixture;

use App\Models\FixtureStat;
use App\Models\Fixture;
use App\Models\Team;

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
        $localTeamId = Team::where('external_id', $stat['team']['id'])->value('id');

        if (!$localTeamId) {
            return; 
        }
        foreach ($stat['statistics'] as $matchStat) {
            FixtureStat::updateOrCreate(
                [
                    'fixture_id' => $fixtureId,
                    'team_id'    => $localTeamId,
                    'name' => $matchStat['type'],
                ],
                [
                    'value' => (float) rtrim($matchStat['value'], '%'),
                ],
            );
        }
    }
}
