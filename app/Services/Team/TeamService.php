<?php

namespace App\Services\Team;

use App\Models\Country;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Player\PlayerService;
use Illuminate\Support\Collection;

class TeamService
{
    public function __construct(
        private readonly FootballApiService $api,
        private readonly PlayerService $service,
    ) {
    }

    public function storeTeams(array $teamsData): void
    {
        $countries = Country::query()->pluck('id', 'name');

        foreach ($teamsData as $teamData) {
            Team::query()->updateOrCreate(
                ['external_id' => $teamData['team']['id']],
                $this->teamAttributes($teamData, $countries),
            );
        }
    }

    /**
     * @return array{name: string, code: string|null, logo_url: string|null, founded_at: int|null, country_id: int|null}
     */
    private function teamAttributes(array $teamData, Collection $countries): array
    {
        return [
            'name' => $teamData['team']['name'],
            'code' => $teamData['team']['code'],
            'logo_url' => $teamData['team']['logo'],
            'founded_at' => $teamData['team']['founded'],
            'country_id' => $countries[$teamData['team']['country']] ?? null,
        ];
    }
}
