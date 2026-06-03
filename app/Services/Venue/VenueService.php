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
            $venuePayload = $this->venuePayload($venueData);

            if ($venuePayload === null) {
                continue;
            }

            Venue::query()->updateOrCreate(
                $this->venueIdentity($venuePayload),
                $this->venueAttributes($venuePayload, $countries),
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
                    $this->syncVenue($venue, $countries);
                }
            });
    }

    private function syncVenue(Venue $venue, Collection $countries): void
    {
        $venueData = $this->footballApiService->getVenue((int) $venue->external_id);

        $this->storeVenues($venueData, $countries);
    }

    private function venuePayload(array $venueData): ?array
    {
        $externalId = data_get($venueData, 'id');
        $name = data_get($venueData, 'name');

        if (! is_numeric($externalId) || ! is_string($name) || $name === '') {
            return null;
        }

        return [
            'external_id' => (int) $externalId,
            'name' => $name,
            'city' => data_get($venueData, 'city'),
            'capacity' => data_get($venueData, 'capacity'),
            'photo_url' => data_get($venueData, 'image'),
            'country' => data_get($venueData, 'country'),
        ];
    }

    private function venueIdentity(array $venueData): array
    {
        return [
            'external_id' => $venueData['external_id'],
        ];
    }

    private function venueAttributes(array $venueData, Collection $countries): array
    {
        return [
            'name' => $venueData['name'],
            'city' => $venueData['city'],
            'capacity' => $venueData['capacity'],
            'photo_url' => $venueData['photo_url'],
            'country_id' => $this->countryId($venueData, $countries),
        ];
    }

    private function countryId(array $venueData, Collection $countries): ?int
    {
        $country = $venueData['country'];

        if (! is_string($country) || $country === '') {
            return null;
        }

        $countryId = $countries[$country] ?? null;

        return is_numeric($countryId) ? (int) $countryId : null;
    }
}
