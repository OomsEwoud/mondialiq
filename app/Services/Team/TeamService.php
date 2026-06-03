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
            $teamPayload = $this->teamPayload($teamData);

            if ($teamPayload === null) {
                continue;
            }

            Team::query()->updateOrCreate(
                $this->teamIdentity($teamPayload),
                $this->teamAttributes($teamPayload, $countries),
            );
        }
    }

    private function teamPayload(array $teamData): ?array
    {
        $externalId = data_get($teamData, 'team.id');
        $name = data_get($teamData, 'team.name');

        if (! is_numeric($externalId) || ! is_string($name) || $name === '') {
            return null;
        }

        return [
            'external_id' => (int) $externalId,
            'name' => $name,
            'code' => data_get($teamData, 'team.code'),
            'logo_url' => data_get($teamData, 'team.logo'),
            'founded_at' => data_get($teamData, 'team.founded'),
            'country' => data_get($teamData, 'team.country'),
        ];
    }

    private function teamIdentity(array $teamData): array
    {
        return [
            'external_id' => $teamData['external_id'],
        ];
    }

    private function teamAttributes(array $teamData, Collection $countries): array
    {
        return [
            'name' => $teamData['name'],
            'code' => $teamData['code'],
            'logo_url' => $teamData['logo_url'],
            'founded_at' => $teamData['founded_at'],
            'country_id' => $this->countryId($teamData, $countries),
        ];
    }

    private function countryId(array $teamData, Collection $countries): ?int
    {
        $country = $teamData['country'];

        if (! is_string($country) || $country === '') {
            return null;
        }

        $countryId = $countries[$country] ?? null;

        return is_numeric($countryId) ? (int) $countryId : null;
    }
}
