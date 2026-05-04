<?php

namespace App\Services\Team;

use App\Models\Team;
use App\Models\Country;
use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;

class TeamService
{
    public function __construct(protected FootballApiService $api, protected PlayerService $service) {}
    public function storeTeams(array $teamsData): void
    {
        $countries = Country::pluck('id', 'name');

        foreach ($teamsData as $teamData) {
            Team::updateOrCreate(
                ['external_id' => $teamData['team']['id']],
                [
                    'name' => $teamData['team']['name'],
                    'code' => $teamData['team']['code'],
                    'logo_url' => $teamData['team']['logo'],
                    'founded_at' => $teamData['team']['founded'],
                    'country_id' => $countries[$teamData['team']['country']] ?? null
                ]
            );
        }
    }
}
