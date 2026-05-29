<?php

namespace App\Services\Standing;

use App\Models\League;
use App\Models\Standing;
use App\Models\Team;

class StandingService
{
    public function storeStandings(array $standingsData): void
    {
        $leagueData = $standingsData[0]['league'];

        $league = League::query()->where('name', $leagueData['name'])->first();
        $season = $leagueData['season'];
        $teams = Team::query()->pluck('id', 'external_id');

        foreach ($leagueData['standings'] as $group) {
            foreach ($group as $standing) {
                $teamId = $teams[$standing['team']['id']] ?? null;

                if (! $teamId) {
                    continue;
                }

                Standing::query()->updateOrCreate(
                    $this->standingIdentity($teamId, $league->id, $season),
                    $this->standingAttributes($standing),
                );
            }
        }
    }

    /**
     * @return array{team_id: int, league_id: int, season: int}
     */
    private function standingIdentity(int $teamId, int $leagueId, int $season): array
    {
        return [
            'team_id' => $teamId,
            'league_id' => $leagueId,
            'season' => $season,
        ];
    }

    /**
     * @return array{
     *     group_name: string,
     *     rank: int,
     *     points: int,
     *     matches_played: int,
     *     wins: int,
     *     draws: int,
     *     losses: int,
     *     goals_for: int,
     *     goals_against: int,
     *     goal_difference: int,
     *     form: string|null
     * }
     */
    private function standingAttributes(array $standing): array
    {
        return [
            'group_name' => $standing['group'],
            'rank' => $standing['rank'],
            'points' => $standing['points'],
            'matches_played' => $standing['all']['played'],
            'wins' => $standing['all']['win'],
            'draws' => $standing['all']['draw'],
            'losses' => $standing['all']['lose'],
            'goals_for' => $standing['all']['goals']['for'],
            'goals_against' => $standing['all']['goals']['against'],
            'goal_difference' => $standing['goalsDiff'],
            'form' => $standing['form'],
        ];
    }
}
