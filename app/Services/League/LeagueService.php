<?php

namespace App\Services\League;

use App\Models\Country;
use App\Models\League;
use App\Models\Season;

class LeagueService
{
    public function storeLeagues(array $leaguesData)
    {
        foreach ($leaguesData as $leagueData) {
            $league = League::updateOrCreate(
                ['external_id' => $leagueData['league']['id']],
                [
                    'name' => $leagueData['league']['name'],
                    'type' => $leagueData['league']['type'],
                    'logo_url' => $leagueData['league']['logo'],
                    'country_id' => Country::where('name', $leagueData['country']['name'])->first()->id ?? null,
                ]
            );
        }
    }
}
