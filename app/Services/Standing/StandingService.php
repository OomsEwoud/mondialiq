<?php

namespace App\Services\Standing;

use App\Models\League;
use App\Models\Team;
use App\Models\Standing;

class StandingService
{
    public function storeStandings(array $standingsData): void
    {
        $leagueData = $standingsData[0]['league'];

        $league = League::where('name', $leagueData['name'])->first();
        $season = $leagueData['season'];
        $teams = Team::pluck('id', 'external_id');

        foreach ($leagueData['standings'] as $group) {
            foreach ($group as $standing) {
                $teamId = $teams[$standing['team']['id']] ?? null;

                if (!$teamId) continue;

                Standing::updateOrCreate(
                    [
                        'team_id'   => $teamId,
                        'league_id' => $league->id,
                        'season'    => $season,
                    ],
                    [
                        'group_name'     => $standing['group'],
                        'rank'           => $standing['rank'],
                        'points'         => $standing['points'],
                        'matches_played' => $standing['all']['played'],
                        'wins'           => $standing['all']['win'],
                        'draws'          => $standing['all']['draw'],
                        'losses'         => $standing['all']['lose'],
                        'goals_for'      => $standing['all']['goals']['for'],
                        'goals_against'  => $standing['all']['goals']['against'],
                        'goal_difference' => $standing['goalsDiff'],
                        'form'           => $standing['form'],
                    ]
                );
            }
        }
    }
}
