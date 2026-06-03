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
            $leaguePayload = $this->leaguePayload($leagueData);

            if ($leaguePayload === null) {
                continue;
            }

            League::query()->updateOrCreate(
                $this->leagueIdentity($leaguePayload),
                $this->leagueAttributes($leaguePayload, $countries),
            );
        }
    }

    private function leaguePayload(array $leagueData): ?array
    {
        $externalId = data_get($leagueData, 'league.id');
        $name = data_get($leagueData, 'league.name');
        $type = data_get($leagueData, 'league.type');

        if (! is_numeric($externalId) || ! is_string($name) || $name === '' || ! is_string($type) || $type === '') {
            return null;
        }

        return [
            'external_id' => (int) $externalId,
            'name' => $name,
            'type' => $type,
            'logo_url' => data_get($leagueData, 'league.logo'),
            'country' => data_get($leagueData, 'country.name'),
        ];
    }

    private function leagueIdentity(array $leagueData): array
    {
        return [
            'external_id' => $leagueData['external_id'],
        ];
    }

    private function leagueAttributes(array $leagueData, Collection $countries): array
    {
        return [
            'name' => $leagueData['name'],
            'type' => $leagueData['type'],
            'logo_url' => $leagueData['logo_url'],
            'country_id' => $this->countryId($leagueData, $countries),
        ];
    }

    private function countryId(array $leagueData, Collection $countries): ?int
    {
        $country = $leagueData['country'];

        if (! is_string($country) || $country === '') {
            return null;
        }

        $countryId = $countries[$country] ?? null;

        return is_numeric($countryId) ? (int) $countryId : null;
    }
}
