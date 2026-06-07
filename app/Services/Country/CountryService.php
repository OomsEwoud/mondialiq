<?php

namespace App\Services\Country;

use App\Models\Country;

class CountryService
{
    private const UNKNOWN_COUNTRY_NAME = 'World';

    private ?int $unknownCountryId = null;

    public function storeAllCountries(array $countriesData): void
    {
        foreach ($countriesData as $countryData) {
            $countryName = data_get($countryData, 'name');

            if (! is_string($countryName) || $countryName === '') {
                continue;
            }

            Country::query()->updateOrCreate(
                $this->countryIdentity($countryName),
                $this->countryAttributes($countryData),
            );
        }
    }

    public function getUnknownId(): ?int
    {
        if ($this->unknownCountryId === null) {
            $this->unknownCountryId = Country::query()->where('name', self::UNKNOWN_COUNTRY_NAME)->first()?->id;
        }

        return $this->unknownCountryId;
    }

    public function normalizeName(?string $name): string
    {
        if (! $name) {
            return self::UNKNOWN_COUNTRY_NAME;
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
            'South Africa' => 'South-Africa',
        ];

        return $map[$name] ?? $name;
    }

    /**
     * @return array{name: string}
     */
    private function countryIdentity(string $countryName): array
    {
        return [
            'name' => $countryName,
        ];
    }

    private function countryAttributes(array $countryData): array
    {
        return [
            'fifa_code' => data_get($countryData, 'code') ?? 'WORLD',
            'flag_url' => data_get($countryData, 'flag'),
        ];
    }
}
