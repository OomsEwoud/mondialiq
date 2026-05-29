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
            Country::query()->updateOrCreate(
                $this->countryIdentity($countryData),
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
    private function countryIdentity(array $countryData): array
    {
        return [
            'name' => $countryData['name'],
        ];
    }

    /**
     * @return array{fifa_code: string, flag_url: string|null}
     */
    private function countryAttributes(array $countryData): array
    {
        return [
            'fifa_code' => $countryData['code'] ?? 'WORLD',
            'flag_url' => $countryData['flag'],
        ];
    }
}
