<?php

namespace App\Services\Country;

use App\Models\Country;

class CountryService
{
    private ?int $unknownCountryId = null;

    public function storeAllCountries(array $countriesData): void
    {
        foreach ($countriesData as $countryData) {
            Country::updateOrCreate(
                [
                    'name' => $countryData['name'],
                ],
                [
                    'fifa_code' => $countryData['code'] ?? 'WORLD',
                    'flag_url' => $countryData['flag'],
                ]
            );
        }
    }

    public function getUnknownId(): ?int
    {
        if ($this->unknownCountryId === null) {
            $this->unknownCountryId = Country::where('name', 'World')->first()?->id;
        }

        return $this->unknownCountryId;
    }

    public function normalizeName(?string $name): string
    {
        if (!$name) {
            return 'World';
        }

        $map = [
            'Costa Rica' => 'Costa-Rica',
            'Saudi Arabia' => 'Saudi-Arabia',
            'Bosnia and Herzegovina' => 'Bosnia',
            'Guinea-Bissau' => 'Guinea',
            'Congo DR' => 'Congo-DR',
            'Türkiye' => 'Turkey',
            'North Macedonia' => 'Macedonia',
            "Côte d'Ivoire" => 'Ivory-Coast',
            'Czechia' => 'Czech-Republic',
            'Trinidad and Tobago' => 'Trinidad-And-Tobago',
            'Korea Republic' => 'South-Korea',
            "South Africa" => "South-Africa",
        ];

        return $map[$name] ?? $name;
    }
}
