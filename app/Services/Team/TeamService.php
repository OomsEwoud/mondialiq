<?php

namespace App\Services\Team;

use App\Models\Country;
use App\Models\Team;
use Illuminate\Support\Collection;

class TeamService
{
    public function storeTeams(array $teamsData): void
    {
        $countries = Country::query()->pluck('id', 'name');

        foreach ($teamsData as $teamData) {
            Team::query()->updateOrCreate(
                $this->teamIdentity($teamData),
                $this->teamAttributes($teamData, $countries),
            );
        }
    }

    /**
     * @return array{external_id: int}
     */
    private function teamIdentity(array $teamData): array
    {
        return [
            'external_id' => $teamData['team']['id'],
        ];
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
            'country_id' => $this->countryId($teamData, $countries),
        ];
    }

    private function countryId(array $teamData, Collection $countries): ?int
    {
        return $countries[$teamData['team']['country']] ?? null;
    }
}
