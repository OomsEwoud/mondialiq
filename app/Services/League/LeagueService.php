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

    /**
     * @return array{external_id: int, name: string, type: string, logo_url: mixed, country: mixed}|null
     */
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

    /**
     * @return array{external_id: int}
     */
    private function leagueIdentity(array $leagueData): array
    {
        return [
            'external_id' => $leagueData['external_id'],
        ];
    }

    /**
     * @return array{name: string, type: string, logo_url: string|null, country_id: int|null}
     */
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
