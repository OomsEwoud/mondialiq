<?php

namespace App\Services\Venue;

use App\Models\Country;
use App\Models\Venue;

class VenueService
{
    public function storeVenues(array $venuesData): void
    {
        $countries = Country::pluck('id', 'name');

        foreach($venuesData as $venueData){
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
}