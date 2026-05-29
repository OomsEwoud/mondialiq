<?php

namespace App\Services\Venue;

use App\Models\Country;
use App\Models\Venue;
use App\Services\Apis\FootballApiService;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class VenueService
{
    public function __construct(
        private readonly FootballApiService $footballApiService,
    ) {
    }

    public function storeVenues(array $venuesData, ?Collection $countries = null): void
    {
        $countries ??= Country::query()->pluck('id', 'name');

        foreach ($venuesData as $venueData) {
            Venue::query()->updateOrCreate(
                ['external_id' => $venueData['id']],
                $this->venueAttributes($venueData, $countries),
            );
        }
    }

    public function syncVenues(): void
    {
        $countries = Country::query()->pluck('id', 'name');

        Venue::query()
            ->whereNotNull('external_id')
            ->chunk(100, function (EloquentCollection $venues) use ($countries) {
                foreach ($venues as $venue) {
                    $venueData = $this->footballApiService->getVenue($venue->external_id);
                    $this->storeVenues($venueData, $countries);
                }
            });
    }

    /**
     * @return array{name: string, city: string|null, capacity: int|null, photo_url: string|null, country_id: int|null}
     */
    private function venueAttributes(array $venueData, Collection $countries): array
    {
        return [
            'name' => $venueData['name'],
            'city' => $venueData['city'],
            'capacity' => $venueData['capacity'],
            'photo_url' => $venueData['image'],
            'country_id' => $countries[$venueData['country']] ?? null,
        ];
    }
}
