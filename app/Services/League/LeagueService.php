<?php

namespace App\Services\League;

use App\Models\Country;
use App\Models\League;
use Illuminate\Support\Collection;

class LeagueService
{
    public function storeLeagues(array $leaguesData): void
    {
        $countries = Country::query()->pluck('id', 'name');

        foreach ($leaguesData as $leagueData) {
            League::query()->updateOrCreate(
                $this->leagueIdentity($leagueData),
                $this->leagueAttributes($leagueData, $countries),
            );
        }
    }

    /**
     * @return array{external_id: int}
     */
    private function leagueIdentity(array $leagueData): array
    {
        return [
            'external_id' => $leagueData['league']['id'],
        ];
    }

    /**
     * @return array{name: string, type: string, logo_url: string|null, country_id: int|null}
     */
    private function leagueAttributes(array $leagueData, Collection $countries): array
    {
        return [
            'name' => $leagueData['league']['name'],
            'type' => $leagueData['league']['type'],
            'logo_url' => $leagueData['league']['logo'],
            'country_id' => $this->countryId($leagueData, $countries),
        ];
    }

    private function countryId(array $leagueData, Collection $countries): ?int
    {
        return $countries[$leagueData['country']['name']] ?? null;
    }
}
