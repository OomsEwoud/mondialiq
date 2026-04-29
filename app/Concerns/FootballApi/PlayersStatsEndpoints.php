<?php

namespace App\Concerns\FootballApi;

trait PlayersStatsEndpoints
{
     public function getTopScorers(int $leagueId, int $season)
    {
        //1 call per day
        return $this->call('/players/topscorers', ['league' => $leagueId, 'season' => $season]);
    }

    public function getTopAssists(int $leagueId, int $season)
    {
        //1 call per day
        return $this->call('/players/topassists', ['league' => $leagueId, 'season' => $season]);
    }

    public function getTopYellowCards(int $leagueId, int $season)
    {
        //1 call per day
        return $this->call('/players/topyellowcards', ['league' => $leagueId, 'season' => $season]);
    }

    public function getTopRedCards(int $leagueId, int $season)
    {
        //1 call per day
        return $this->call('/players/topredcards', ['league' => $leagueId, 'season' => $season]);
    }

    public function getPlayerStats(int $playerId, int $leagueId, int $season)
    {
        //1 call per day
        return $this->call('/players', ['id' => $playerId, 'league' => $leagueId, 'season' => $season]);
    }
}
