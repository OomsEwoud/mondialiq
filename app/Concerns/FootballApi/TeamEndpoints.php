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
        return $this->call('/teams/statistics', ['team' => $teamId, 'season' => $season, 'league' => $leagueId]);
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
        //1 call per week
        return $this->call('/players/squads', ['team' => $teamId]);
    }

    public function getPlayersByLeagueSeason(int $leagueId, int $season): array
    {
        //1 call per tournament with pagination
        return $this->callAllPages('/players', ['league' => $leagueId, 'season' => $season]);
    }

}
