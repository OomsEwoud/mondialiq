<?php

namespace App\Concerns\FootballApi;

trait MetadataEndpoints
{
    public function getLeagueSeason(int $leagueId, int $season): array
    {
        return $this->call('/leagues', ['id' => $leagueId, 'season' => $season]);
    }

    public function getCountries(): array
    {
        return $this->call('/countries');
    }

    public function getLeagues(): array
    {
        return $this->call('/leagues');
    }
}
