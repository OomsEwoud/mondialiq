<?php

namespace App\Services\Venue;

use App\Models\Country;
use App\Models\Venue;
use App\Services\Apis\FootballApiService;
use Illuminate\Support\Collection;

class VenueService
{
    public function __construct(protected FootballApiService $footballApiService){}

    public function storeVenues(array $venuesData, ?Collection $countries = null): void
    {
        $countries ??= Country::pluck('id', 'name');

        foreach ($venuesData as $venueData) {
            Venue::updateOrCreate(
                ['external_id' => $venueData['id']],
                [
                    'name' => $venueData['name'],
                    'city' => $venueData['city'],
                    'capacity' => $venueData['capacity'],
                    'photo_url' => $venueData['image'],
                    'country_id' => $countries[$venueData['country']] ?? null
                ]
            );
        }
    }

    public function syncVenues(): void
    {
        $countries = Country::pluck('id', 'name');

        Venue::whereNotNull('external_id')->chunk(100, function ($venues) use ($countries) {
            foreach ($venues as $venue) {
                $venueData = $this->footballApiService->getVenue($venue->external_id);
                $this->storeVenues($venueData, $countries);
            }
        });
    }
}
