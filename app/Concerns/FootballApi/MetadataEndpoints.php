<?php

namespace App\Concerns\FootballApi;

trait MetadataEndpoints
{
    public function getCountries()
    {
        //1 call per day
        return $this->call('/countries');
    }

    public function getLeagues()
    {
        //1 call per day
        return $this->call('/leagues');
    }

    public function getSeasons()
    {
        //1 call per day
        return $this->call('/leagues/seasons');
    }
}
