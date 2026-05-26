<?php

namespace App\Concerns\FootballApi;

trait TeamEndpoints
{
    public function getTeams(int $idLeague, int $season): array
    {
        //1 call per day
        return $this->call('/teams', ['league' => $idLeague, 'season' => $season]);
    }

    public function getTeamsStats(int $teamId, int $season, int $leagueId): array
    {
        //1 call per day
        return $this->getTeamStatistics($teamId, $leagueId, $season);
    }

    public function getTeamStatistics(int $teamId, int $leagueId, int $season, ?string $date = null): array
    {
        $params = [
            'team' => $teamId,
            'league' => $leagueId,
            'season' => $season,
        ];

        if ($date) {
            $params['date'] = $date;
        }

        //1 call per day
        return $this->call('/teams/statistics', $params);
    }

    public function getStandings(int $idLeague, int $season): array
    {
        //1 call per hour
        return $this->call('/standings', ['league' => $idLeague, 'season' => $season]);
    }

    public function getCoach(int $teamId): array
    {
        //1 call per day
        return $this->call('/coachs', ['team' => $teamId]);
    }

    public function getPlayers(int $teamId): array
    {
        // Authoritative squad/call-up list for a team.
        return $this->call('/players/squads', ['team' => $teamId]);
    }

    public function getPlayersByLeagueSeason(int $leagueId, int $season): array
    {
        // Player details and season statistics, not the authoritative squad list.
        return $this->callAllPages('/players', ['league' => $leagueId, 'season' => $season]);
    }

}
