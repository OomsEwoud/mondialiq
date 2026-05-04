<?php

namespace App\Services\Coach;

use App\Models\Coach;
use App\Models\Team;
use App\Models\Country;
use App\Services\Apis\FootballApiService;
use App\Services\Country\CountryService;

class CoachService
{
    protected array $countriesCache = [];

    public function __construct(protected FootballApiService $api, protected CountryService $countryService) {}

    private function loadCountryCache(): void
    {
        if (empty($this->countriesCache)) {
            $this->countriesCache = Country::pluck('id', 'name')->toArray();
        }
    }

    public function syncCoaches(): void
    {
        Team::chunk(100, function ($teams) {
            foreach ($teams as $team) {
                $coaches = $this->api->getCoach($team->external_id);

                foreach ($coaches as $coachData) {
                    $isCurrentCoach = collect($coachData['career'])->contains(function ($career) use ($team) {
                        return $career['team']['id'] === $team->external_id && $career['end'] === null;
                    });

                    if ($isCurrentCoach) {
                        $this->storeCoach($team, $coachData);
                        break; //bc api gives whole staff only need the first coach
                    }
                }
            }
        });
    }

    public function storeCoach(Team $team, array $coachData): void
    {
        if (isset($coachData['nationality'])) {
            $this->loadCountryCache();
            $apiName = $this->countryService->normalizeName($coachData['nationality']);
            $countryId = $this->countriesCache[$apiName] ?? $this->countryService->getUnknownId();
        }

        Coach::updateOrCreate(
            ['external_id' => $coachData['id']],
            [
                'team_id' => $team->id,
                'country_id' => $countryId ?? null,
                'first_name' => $coachData['firstname'] ?? null,
                'last_name' => $coachData['lastname'] ?? null,
                'display_name' => $coachData['name'],
                'photo_url' => $coachData['photo'],
                'birth_date' => $coachData['birth']['date'],
            ]
        );
    }
}
