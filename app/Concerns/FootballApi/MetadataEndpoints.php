<?php

namespace App\Concerns\FootballApi;

trait MetadataEndpoints
{
    public function getCountries(): array
    {
        return $this->call('/countries');
    }

    public function getLeagues(): array
    {
        return $this->call('/leagues');
    }
}
