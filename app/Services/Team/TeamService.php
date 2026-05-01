<?php

namespace App\Services\Team;

use App\Models\Team;
use App\Models\Country;

class TeamService
{
    public function storeTeams(array $teamsData)
    {
        foreach ($teamsData as $teamData) {
            $team = Team::updateOrCreate(
                ['external_id' => $teamData['team']['id']],
                [
                    'name' => $teamData['team']['name'],
                    'code' => $teamData['team']['code'],
                    'logo_url' => $teamData['team']['logo'],
                    'founded_at' => $teamData['team']['founded'],
                    'country_id' => Country::where('name', $teamData['team']['country'])->first()?->id ?? null
                ]
            );
        }
    }
}
