<?php

namespace App\Services\Coach;

use App\Models\Coach;
use App\Models\Country;
use App\Models\Team;
use App\Services\Apis\FootballApiService;
use App\Services\Country\CountryService;
use Illuminate\Database\Eloquent\Collection;

class CoachService
{
    private array $countriesCache = [];

    public function __construct(
        private readonly FootballApiService $api,
        private readonly CountryService $countryService,
    ) {}

    private function loadCountryCache(): void
    {
        if (empty($this->countriesCache)) {
            $this->countriesCache = Country::query()->pluck('id', 'name')->toArray();
        }
    }

    public function syncCoaches(): void
    {
        Team::query()->whereNotNull('external_id')->chunk(100, function (Collection $teams) {
            foreach ($teams as $team) {
                $this->syncTeamCoach($team);
            }
        });
    }

    public function storeCoach(Team $team, array $coachData): void
    {
        $coachPayload = $this->coachPayload($coachData);

        if ($coachPayload === null) {
            return;
        }

        Coach::query()->updateOrCreate(
            $this->coachIdentity($coachPayload),
            $this->coachAttributes($team, $coachPayload),
        );
    }

    private function syncTeamCoach(Team $team): void
    {
        $coachData = $this->currentCoachData($team);

        if ($coachData === null) {
            return;
        }

        $this->storeCoach($team, $coachData);
    }

    private function currentCoachData(Team $team): ?array
    {
        foreach ($this->api->getCoach((int) $team->external_id) as $coachData) {
            if ($this->isCurrentTeamCoach($coachData, $team)) {
                return $coachData;
            }
        }

        return null;
    }

    private function isCurrentTeamCoach(array $coachData, Team $team): bool
    {
        return collect($coachData['career'] ?? [])->contains(
            fn (array $career): bool => data_get($career, 'team.id') === $team->external_id
                && data_get($career, 'end') === null,
        );
    }

    private function coachPayload(array $coachData): ?array
    {
        $externalId = data_get($coachData, 'id');
        $displayName = data_get($coachData, 'name');

        if (! is_numeric($externalId) || ! is_string($displayName) || $displayName === '') {
            return null;
        }

        return [
            'external_id' => (int) $externalId,
            'nationality' => data_get($coachData, 'nationality'),
            'first_name' => data_get($coachData, 'firstname'),
            'last_name' => data_get($coachData, 'lastname'),
            'display_name' => $displayName,
            'photo_url' => data_get($coachData, 'photo'),
            'birth_date' => data_get($coachData, 'birth.date'),
        ];
    }

    private function coachIdentity(array $coachData): array
    {
        return [
            'external_id' => $coachData['external_id'],
        ];
    }

    private function coachAttributes(Team $team, array $coachData): array
    {
        return [
            'team_id' => $team->id,
            'country_id' => $this->countryId($coachData['nationality']),
            'first_name' => $coachData['first_name'],
            'last_name' => $coachData['last_name'],
            'display_name' => $coachData['display_name'],
            'photo_url' => $coachData['photo_url'],
            'birth_date' => $coachData['birth_date'],
        ];
    }

    private function countryId(mixed $nationality): ?int
    {
        if (! is_string($nationality) || $nationality === '') {
            return null;
        }

        $this->loadCountryCache();
        $apiName = $this->countryService->normalizeName($nationality);

        return $this->countriesCache[$apiName] ?? $this->countryService->getUnknownId();
    }
}
