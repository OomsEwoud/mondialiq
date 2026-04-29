<?php

namespace App\Services\Country;

use App\Models\Country;

class CountryService
{
    public function storeAllCountries(array $countriesData): void
    {
        foreach ($countriesData as $countryData) {
            Country::updateOrCreate(
                ['external_id' => $countryData['id']],
                [
                    'fifa_code' => $countryData['code'] ?? 'WORLD',
                    'name' => $countryData['name'],
                    'flag_url' => $countryData['flag'],
                ]
            );
        }
    }
}