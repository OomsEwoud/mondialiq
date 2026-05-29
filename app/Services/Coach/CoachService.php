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
    ) {
    }

    private function loadCountryCache(): void
    {
        if (empty($this->countriesCache)) {
            $this->countriesCache = Country::query()->pluck('id', 'name')->toArray();
        }
    }

    public function syncCoaches(): void
    {
        Team::query()->chunk(100, function (Collection $teams) {
            foreach ($teams as $team) {
                $coaches = $this->api->getCoach($team->external_id);

                foreach ($coaches as $coachData) {
                    $isCurrentCoach = collect($coachData['career'])->contains(function (array $career) use ($team) {
                        return $career['team']['id'] === $team->external_id && $career['end'] === null;
                    });

                    if ($isCurrentCoach) {
                        $this->storeCoach($team, $coachData);
                        break;
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

        Coach::query()->updateOrCreate(
            ['external_id' => $coachData['id']],
            [
                'team_id' => $team->id,
                'country_id' => $countryId ?? null,
                'first_name' => $coachData['firstname'] ?? null,
                'last_name' => $coachData['lastname'] ?? null,
                'display_name' => $coachData['name'],
                'photo_url' => $coachData['photo'],
                'birth_date' => $coachData['birth']['date'],
            ],
        );
    }
}
